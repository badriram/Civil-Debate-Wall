import datetime
import random
import urllib
from cdw import utils
from auth import auth_provider
from cdw.forms import (UserRegistrationForm, SuggestQuestionForm, 
                       VerifyPhoneForm, EditProfileForm)
from cdw.models import PhoneVerificationAttempt
from cdw.services import cdw, connection_service 
from flask import (current_app, render_template, request, redirect,
                   session, flash, abort, jsonify)
from flaskext.login import login_required, current_user, request, login_user
from lib import facebook
from werkzeug.exceptions import BadRequest

def get_facebook_profile(token):
    graph = facebook.GraphAPI(token)
    return graph.get_object("me")

def init(app):
    @app.route("/")
    def index():
        return render_template("index.html", section_selector="home", 
                               page_selector="index")
    
    @app.route("/login")
    def login():
        form = auth_provider.login_form(request.args)
        return render_template("login.html", login_form=form, 
                               section_selector="login", page_selector="index")
    
    @app.route("/profile")
    @login_required
    def profile():
        # oddly needed for lookup
        user = cdw.users.with_id(current_user.get_id())
         
        threads = cdw.get_threads_started_by_user(current_user)[:5]
        posts = cdw.posts.with_fields(author=user)[:5]
        current_app.logger.debug(posts)
        return render_template("profile.html",
                               section_selector="profile", 
                               page_selector="index",
                               threads=threads,
                               posts=posts)
        
    @app.route("/profile/edit", methods=['GET','POST'])
    @login_required
    def profile_edit():
        user = current_user
        form = EditProfileForm()
        
        if request.method == 'POST' and form.validate():
            user = cdw.update_user_profile(user.get_id(),
                                           form.username.data,
                                           form.email.data,
                                           form.password.data)
            
            flash('Your profile has been updated.')
            return redirect('/profile')
            
        form.username.data = user.username
        form.email.data = user.email
        
        phoneForm = VerifyPhoneForm(csrf_enabled=False)
        phoneForm.phonenumber.data = user.phoneNumber
        
        return render_template("profile_edit.html", 
                               form=form,
                               phoneForm=phoneForm,
                               section_selector="profile", 
                               page_selector="edit")
    
    
    @app.route("/register", methods=['POST'])
    def register_post():
        if current_user.is_authenticated():
            return redirect("/")
        
        # Always clear out any verified phone numbers
        session.pop('verified_phone', None)
        
        form = UserRegistrationForm()
        
        if form.validate():
            # Register the user
            user = cdw.register_website_user(
                form.username.data, 
                form.email.data, 
                form.password.data, 
                session.pop('verified_phone', None)
            )
            
            # Try connecting their facebook account if a token
            # is in the session
            try:
                handler = current_app.social.facebook.connect_handler
                
                conn = handler.get_connection_values({
                    "access_token": session['facebooktoken'] 
                })
                
                conn['user_id'] = str(user.id)
                connection_service.save_connection(**conn)
            except KeyError:
                pass
            except Exception, e:
                current_app.logger.error(
                    'Could not save connection to Facebook: %s' % e)
                
            # Log the user in
            login_user(user)
            
            # Clear out the temporary facebook data
            session.pop('facebookuserid', None)
            session.pop('facebooktoken', None)
            
            # Send them to get their picture taken
            return redirect("/register/photo")
        
        current_app.logger.debug(form.errors)
        
        return render_template('register.html', 
                               section_selector="register", 
                               page_selector="email", 
                               form=form, 
                               show_errors=True,
                               phoneForm=VerifyPhoneForm(csrf_enabled=False))
        
    
    @app.route("/register/email", methods=['GET', 'POST'])
    def register_email():
        if current_user.is_authenticated():
            return redirect("/")
        
        form = UserRegistrationForm()
        # You'd think this wouldn't need to be called here but
        # a CSRF error will come up when the form is POSTed to 
        # /register. So below there's a show_errors flag in the
        # template context blow
        form.validate()
        
        # See if a password was passed from the register modal
        form.password.data = request.form.get('password', '')
        
        
        return render_template('register.html', 
                               section_selector="register", 
                               page_selector="email", 
                               form=form, 
                               show_errors=False,
                               phoneForm=VerifyPhoneForm(csrf_enabled=False))
    
    @app.route("/register/facebook", methods=['GET'])
    def register_facebook():
        # Always clear out any verified phone numbers
        session.pop('verified_phone', None)
        
        # Try getting their facebook profile
        try: 
            profile = get_facebook_profile(session['facebooktoken'])
            default_email = profile['email']
        except: 
            profile = None
            default_username = ''
        
        try:
            # Check to see if we can use their facebook username
            # as their CDW username
            cdw.users.with_username(profile['username'])
            default_username = ''
        except: 
            # If an exception is thrown that means a username
            # wasn't found and thats a good thing
            default_username = profile['username']
        
        phoneForm = VerifyPhoneForm(csrf_enabled=False)
        form = UserRegistrationForm(username=default_username, 
                                    email=default_email,
                                    csrf_enabled=False)
        
        form.password.data = request.form.get('password', '')
        form.validate()
        
        return render_template('register.html',
                               form=form, 
                               phoneForm=phoneForm,
                               facebook_profile=profile, 
                               show_errors=False,
                               section_selector="register", 
                               page_selector="facebook")
        
    
    @app.route("/register/photo")
    @login_required
    def register_photo():
        return render_template('register_photo.html',
                               section_selector="register", 
                               page_selector="photo")
        
    @app.route("/register/complete")
    @login_required
    def register_complete():
        return render_template('register_complete.html',
                               section_selector="register", 
                               page_selector="complete")
    
    
    @app.route("/privacy", methods=['GET'])
    def privacy():
        return render_template('privacy.html', 
                               section_selector="privacy", 
                               page_selector="index")
    
    @app.route("/contact")
    def contact():
        return render_template('contact.html', 
                               section_selector="contact", 
                               page_selector="index")
    
    
    @app.route("/suggest", methods=['GET','POST'])
    @login_required
    def suggest():
        form = SuggestQuestionForm(request.form) 
        
        if request.method == 'POST':
            if form.validate():
                cdw.questions.save(form.to_question())
                flash('Thanks for suggesting a question!');
                return redirect("/")
        
        return render_template('suggest.html',
                               section_selector="suggest", 
                               page_selector="index",
                               form=form, 
                               categories=cdw.categories.all());
                               
    @app.route("/verify/phone", methods=['POST'])
    def verify_phone():
        session.pop('verified_phone', None)
        
        form = VerifyPhoneForm(csrf_enabled=False)
        
        if form.validate():
            
            while(True):
                token = str(random.randint(100000, 999999))
                
                try:
                    # Make sure a random token doesn't exist yet
                    current_app.cdw.phoneverifications.with_token(token)
                except:
                    expires = (datetime.datetime.utcnow() + 
                               datetime.timedelta(minutes=5))
                    
                    phone = utils.normalize_phonenumber(form.phonenumber.data)
                    
                    pva = PhoneVerificationAttempt(expires=expires, 
                                                   token=token, 
                                                   phoneNumber=phone)
                    
                    current_app.cdw.phoneverifications.save(pva)
                    session['phone_verify_id'] = str(pva.id)
                    
                    current_app.logger.debug(
                        'Saved phone number verification attempt: %s' % pva)
                    
                    config = current_app.config['CDW']['twilio']
                    sender = config['switchboard_number']
                    current_app.twilio.send_message(pva.token, sender, [phone])
                    
                    break # out of the while loop
            
            return 'success'
        
        current_app.logger.debug(form.errors)
        raise BadRequest('Invalid phone number')
    
    @app.route("/verify/code", methods=['POST'])
    def verify_code():
        session.pop('verified_phone', None)
        msg = 'no match'
        
        try:
            pva_id = session['phone_verify_id']
            pva = current_app.cdw.phoneverifications.with_id(pva_id)
            
            if pva.expires < datetime.datetime.utcnow():
                msg = 'expired'
            
            if request.form['code'] == pva.token:
                session.pop('phone_verify_id', None)
                
                if current_user.is_authenticated():
                    current_user.phoneNumber = pva.phoneNumber
                    cdw.users.save(current_user)
                    
                else:
                    # Save it in the session for a little bit
                    # in case this is a registration process
                    session['verified_phone'] = pva.phoneNumber
                
                current_app.logger.debug(
                    'Verified phone number: %s' % pva.phoneNumber)
                
                return 'success'
            
        except:
            pass
            
        raise BadRequest(msg)
    
    @app.route("/questions/<question_id>")
    def question_show(question_id):
        try:
            cdw.questions.with_id(question_id)
        except:
            abort(404)
        
        return redirect('/#/questions/%s' % question_id)
        """    
        return render_template("index.html",
                               question_id=question_id, 
                               section_selector="questions", 
                               page_selector="show")
        """
    
    @app.route("/questions/archive")
    def questions_archive():
        now = datetime.datetime.utcnow()
        questions = cdw.questions.with_fields(endDate__lt=now)
        return render_template('questions_archive.html', 
                               questions=questions,
                               categories=cdw.categories.all(),
                               section_selector="questions", 
                               page_selector="archive")
        
    @app.route("/questions/archive/<category_id>")
    def questions_archive_category(category_id):
        try:
            cat = cdw.categories.with_id(category_id)
            questions = cdw.questions.with_fields(archived=True, category=cat)
            return render_template('questions_archive.html', 
                                   current_category=cat,
                                   questions=questions,
                                   categories=cdw.categories.all(),
                                   section_selector="questions", 
                                   page_selector="archive")
        except Exception, e:
            current_app.logger.error("Error getting archive category: %s" % e)
            abort(404)
        
        
    @app.route("/questions/<question_id>/stats")
    def stats(question_id):
        try:
            question = cdw.questions.with_id(question_id)
        except:
            abort(404)
            
        return render_template('stats.html', question=question,
            section_selector="stats", page_selector="show")
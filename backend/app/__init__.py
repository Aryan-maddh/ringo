from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from pathlib import Path
import os

db = SQLAlchemy()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address, default_limits=['200 per minute'])


def _migrate(app: Flask) -> None:
    """Add any new columns to existing tables without Flask-Migrate."""
    from sqlalchemy import inspect, text

    with app.app_context():
        inspector = inspect(db.engine)
        if 'businesses' not in inspector.get_table_names():
            return
        existing = {col['name'] for col in inspector.get_columns('businesses')}
        new_cols = [
            ('owner_phone',             "VARCHAR(20)"),
            ('timezone',                "VARCHAR(100) DEFAULT 'America/New_York'"),
            ('call_forwarding_enabled', "BOOLEAN DEFAULT FALSE NOT NULL"),
            ('auto_sms_enabled',        "BOOLEAN DEFAULT TRUE NOT NULL"),
            ('voice_message',           "TEXT"),
            ('twilio_number_sid',       "VARCHAR(50)"),
            ('sms_count_this_month',    "INTEGER DEFAULT 0"),
            ('whatsapp_number',         "VARCHAR(20)"),
            ('whatsapp_number_sid',     "VARCHAR(50)"),
            ('auto_whatsapp_enabled',   "BOOLEAN DEFAULT FALSE NOT NULL"),
            ('whatsapp_message',        "TEXT"),
        ]
        with db.engine.connect() as conn:
            for col_name, col_def in new_cols:
                if col_name not in existing:
                    conn.execute(text(f'ALTER TABLE businesses ADD COLUMN {col_name} {col_def}'))
            conn.commit()

        if 'sms_logs' in inspector.get_table_names():
            existing_sms_cols = {col['name'] for col in inspector.get_columns('sms_logs')}
            if 'message_type' not in existing_sms_cols:
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE sms_logs ADD COLUMN message_type VARCHAR(20) DEFAULT 'sms'"))
                    conn.commit()


def create_app() -> Flask:
    load_dotenv(Path(__file__).parent.parent / '.env')

    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/ringo')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-me')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-change-me')

    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    CORS(app, origins=[
        os.getenv('FRONTEND_URL', 'http://localhost:3000'),
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ], supports_credentials=True)

    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.calls import calls_bp
    from app.routes.sms import sms_bp
    from app.routes.settings import settings_bp
    from app.routes.webhooks import webhooks_bp
    from app.routes.admin import admin_bp
    from app.routes.billing import billing_bp
    from app.routes.numbers import numbers_bp
    from app.routes.reviews import reviews_bp
    from app.routes.campaigns import campaigns_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(calls_bp, url_prefix='/api')
    app.register_blueprint(sms_bp, url_prefix='/api')
    app.register_blueprint(settings_bp, url_prefix='/api')
    app.register_blueprint(webhooks_bp, url_prefix='/api/webhooks')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(billing_bp, url_prefix='/api')
    app.register_blueprint(numbers_bp, url_prefix='/api/numbers')
    app.register_blueprint(reviews_bp, url_prefix='/api')
    app.register_blueprint(campaigns_bp, url_prefix='/api')

    with app.app_context():
        try:
            from app.models import user, business, call_log, sms_log  # noqa: F401
            from app.models import review_request, campaign  # noqa: F401
            db.create_all()
        except Exception:
            pass

    try:
        _migrate(app)
    except Exception:
        pass

    return app

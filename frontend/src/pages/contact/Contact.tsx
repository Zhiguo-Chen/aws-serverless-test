import './Contact.scss';
import { PhoneOutlined, MailOutlined } from '@ant-design/icons';

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-card">
        <div className="contact-block">
          <div className="contact-icon call">
            <PhoneOutlined />
          </div>
          <div>
            <div className="contact-title">Call To Us</div>
            <div className="contact-desc">
              We are available 24/7, 7 days a week.
            </div>
            <div className="contact-desc">Phone: +8801611112222</div>
          </div>
        </div>
        <hr className="contact-divider" />
        <div className="contact-block">
          <div className="contact-icon mail">
            <MailOutlined />
          </div>
          <div>
            <div className="contact-title">Write To US</div>
            <div className="contact-desc">
              Fill out our form and we will contact you within 24 hours.
            </div>
            <div className="contact-desc">Emails: customer@exclusive.com</div>
            <div className="contact-desc">Emails: support@exclusive.com</div>
          </div>
        </div>
      </div>
      <form className="contact-form">
        <div className="contact-form-row">
          <input className="contact-input" placeholder="Your Name *" />
          <input className="contact-input" placeholder="Your Email *" />
          <input className="contact-input" placeholder="Your Phone *" />
        </div>
        <textarea
          className="contact-textarea"
          placeholder="Your Message"
          rows={7}
        />
        <div className="contact-form-actions">
          <button className="contact-submit" type="submit">
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default Contact;

import { useRef, useState } from 'react';
import { Facebook, Instagram, Youtube, X } from 'lucide-react';
import { guestShowcase } from '../lib/config';

const information: Record<string, string> = {
  'Audio Description':
    'The demo player uses the original audio from Big Buck Bunny. Additional audio-description tracks are not available.',
  'Help Centre':
    'Choose a title to view details, play the demo trailer, or save it to My list. Your guest library stays in this browser.' +
    (guestShowcase ? '' : ' Create an account to keep separate profiles.'),
  'Gift Cards': 'This independent portfolio demo has no payments, subscriptions, or gift cards.',
  'Media Centre':
    'Afterglow is an independent streaming interface project with a fictional catalog and openly licensed demo playback.',
  'Investor Relations': 'This is a portfolio project, not a commercial streaming service.',
  Jobs: 'There are no current job openings associated with this project.',
  'Terms of Use':
    'Use this project for demonstration and learning. Catalog titles are fictional. Third-party artwork and demo media retain their original licenses.',
  Privacy:
    'Guest saves, likes, and playback position are stored in your browser. This demo does not include advertising analytics.' +
    (guestShowcase ? '' : ' Accounts store profile libraries on the local application server.'),
  'Legal Notices':
    'This independent project is not affiliated with Netflix. Photography is supplied by Unsplash. Demo playback: Big Buck Bunny, © Blender Foundation, CC BY 3.0.',
  'Cookie Preferences':
    'Guest preferences use local browser storage. No optional advertising or analytics cookies are set.' +
    (guestShowcase ? '' : ' A session cookie is used for account sign-in.'),
  'Corporate Information': 'Afterglow is a demonstration application in the netflix-clone project.',
  'Contact Us':
    'For questions about this project, contact its repository maintainer through the project repository.',
};

export function Footer() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [topic, setTopic] = useState('');
  return (
    <footer className="browse-footer">
      <div className="footer-socials" aria-label="About our social channels">
        {[Facebook, Instagram, X, Youtube].map((Icon, index) => (
          <button
            key={index}
            aria-label={
              [
                'Facebook information',
                'Instagram information',
                'X information',
                'YouTube information',
              ][index]
            }
            onClick={() => {
              setTopic('Social channels');
              dialog.current?.showModal();
            }}
          >
            <Icon size={24} />
          </button>
        ))}
      </div>
      <div className="footer-links">
        {Object.keys(information).map((label) => (
          <button
            key={label}
            onClick={() => {
              setTopic(label);
              dialog.current?.showModal();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p>© {new Date().getFullYear()} Afterglow · Independent streaming demo</p>
      <dialog
        ref={dialog}
        className="footer-info"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className="round-button"
          aria-label="Close information"
          onClick={() => dialog.current?.close()}
        >
          <X size={20} />
        </button>
        <h2>{topic}</h2>
        <p>
          {information[topic] || 'This portfolio project does not have official social accounts.'}
        </p>
      </dialog>
    </footer>
  );
}

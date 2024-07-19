import {CloseSVGIcon} from "@react-md/material-icons";
import './style.scss';

type Props = {
  title: string;
  subtitle: string;
  toggleChat: () => void;
  showCloseButton: boolean;
  titleAvatar?: string;
}

function Header({ title, subtitle, toggleChat, showCloseButton, titleAvatar }: Props) {
  return (
    <div className="rcw-header">
      {showCloseButton &&
        <button className="rcw-close-button" onClick={toggleChat}>
          <CloseSVGIcon className="rcw-close"/>
        </button>
      }
      <p className="rcw-title">
        {titleAvatar && <img src={titleAvatar} className="avatar" alt="profile" />}
        {title}
      </p>
      <span className="rcw-subtitle">{subtitle}</span>
    </div>
  );
}

export default Header;

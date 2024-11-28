import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/login');
  };
  return (
    <button
      onClick={handleClick}
      style={{ width: '100px', height: '48px', background: 'green' }}
    >
      To Login
    </button>
  );
};

export default Header;

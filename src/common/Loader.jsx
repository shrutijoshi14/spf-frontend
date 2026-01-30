import './loader.css';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  return (
    <div className={`loader-container ${fullScreen ? 'loader-fullscreen' : ''}`}>
      <div className="loader-wrapper">
        <div className="loader-ring"></div>
        <img src="/spf_logo-removebg-preview.png" alt="Loading..." className="loader-logo" />
      </div>
    </div>
  );
};

export default Loader;

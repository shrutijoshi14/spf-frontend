import './loader.css';

const Loader = ({ size = 'medium' }) => {
  // Scale based on props if needed, for now just standard
  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        <div className="loader-ring"></div>
        <img src="/spf_logo-removebg-preview.png" alt="Loading..." className="loader-logo" />
      </div>
    </div>
  );
};

export default Loader;

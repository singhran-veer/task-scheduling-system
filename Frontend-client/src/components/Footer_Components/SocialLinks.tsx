import "./SocialLinks.scss";

const SocialLinks = () => {
    return (
        <div className="footer-right">
            <div className="social-links">
                <a
                    href="https://linkedin.com/in/ranveer-singh-2023542b4/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-icon linkedin"
                    aria-label="LinkedIn"
                >
                    <i className="fa-brands fa-linkedin-in"></i>
                </a>

                <a
                    href="https://github.com/singhran-veer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-icon github"
                    aria-label="GitHub"
                >
                    <i className="fa-brands fa-github"></i>
                </a>

            </div>
        </div>
    );
};

export default SocialLinks;

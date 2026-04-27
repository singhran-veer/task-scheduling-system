import "./FooterBottom.scss";

const FooterBottom = () => {
    return (
        <div className="footer-bottom">
            <div className="footer-bottom-content">
                <p className="copyright">
                    <strong>BHEL Training Program</strong>
                </p>
                <p className="developer-credit">
                    Designed & Developed by{" "}
                    <a
                        href=""
                        
                        className="developer-link underline-hover"
                    >
                        Ranveer Singh, Imran Ali
                    </a>
                </p>
            </div>
        </div>
    );
};

export default FooterBottom;

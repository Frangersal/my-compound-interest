import React from 'react'
import '../assets/style/Footer.css'
import fgsmIcon from '../assets/icons/fgsm.svg'
import githubIcon from '../assets/icons/github.svg'
import pagespeedIcon from '../assets/icons/pagespeedinsights.webp'

export default function Footer() {
    const year = new Date().getFullYear()
    return (
        <footer className="app-footer">
            <div className="footer-inner">
                <div className="footer-left">
                    <div className="footer-brand">&lt; Frangersal /&gt;</div>
                    <div className="footer-meta">{year} — Calculadora de Interes Compuesto</div>
                </div>
                <div className="footer-right">
                    <div className="footer-icons">
                        <a className="icon-btn" aria-label="fgsm" href="https://frangersal.netlify.app/" target="_blank" rel="noopener noreferrer">
                            <img src={fgsmIcon} alt="fgsm" className="icon" />
                        </a>
                        <a className="icon-btn" aria-label="github" href="https://github.com/Frangersal/my-compound-interest" target="_blank" rel="noopener noreferrer">
                            <img src={githubIcon} alt="github" className="icon" />
                        </a>
                        <a className="icon-btn" aria-label="pagespeed" href="https://developers.google.com/speed/pagespeed/insights/?url=https%3A%2F%2Fcompound-interest-fgsm.netlify.app%2F&tab=desktop" target="_blank" rel="noopener noreferrer">
                            <img src={pagespeedIcon} alt="PageSpeed Insights" className="icon" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

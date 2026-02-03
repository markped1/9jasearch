import styles from './Layout.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                    <p style={{ margin: 0 }}>
                        &copy; {new Date().getFullYear()} Eagle Search Naija. Trusted Nigerian Business Search.
                        <span style={{ marginLeft: '10px', paddingLeft: '10px', borderLeft: '1px solid #ddd', color: '#ffd700', fontWeight: 600 }}>
                            Designed by Thompson Obosa
                        </span>
                    </p>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#888' }}>
                    <span style={{ marginRight: '1rem' }}>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>
        </footer>
    );
}

import Link from 'next/link';
import styles from './Layout.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <span>
                    &copy; {new Date().getFullYear()} 9jasearch. SEARCH NAIJA, FIND MORE.
                    {' '}|{' '}Designed by{' '}
                    <span className={styles.designer}>Thompson Obosa</span>
                    {' '}|{' '}
                    <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
                    {' '}|{' '}
                    <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
                </span>
            </div>
        </footer>
    );
}

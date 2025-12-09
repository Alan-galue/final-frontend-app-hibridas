import { useEffect } from 'react';
import backgroundMain from '../assets/images/background-main.jpg';

const BackgroundWrapper = ({ children }) => {
    useEffect(() => {
        document.body.style.backgroundImage = `url(${backgroundMain})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        
        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundAttachment = '';
        };
    }, []);

    return <>{children}</>;
};

export default BackgroundWrapper;


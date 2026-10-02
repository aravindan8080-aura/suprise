import '../css/app.css';

import { createRoot } from 'react-dom/client';
import BirthdayIndex from '../js/Pages/Birthday/Index';
import data from './birthday.json';

createRoot(document.getElementById('app')).render(<BirthdayIndex {...data} />);

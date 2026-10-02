import '../../css/app.css';

import { createRoot } from 'react-dom/client';
import ProposeIndex from '../../js/Pages/Propose/Index';
import data from './propose.json';

createRoot(document.getElementById('app')).render(<ProposeIndex {...data} />);

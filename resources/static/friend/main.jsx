import '../../css/app.css';

import { createRoot } from 'react-dom/client';
import FriendIndex from '../../js/Pages/Friend/Index';
import data from './friend.json';

createRoot(document.getElementById('app')).render(<FriendIndex {...data} />);

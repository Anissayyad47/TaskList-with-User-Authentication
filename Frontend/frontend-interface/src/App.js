import './App.css';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import UserLogin from './Component/UserLogin';
import UserSignIn from './Component/UserSignIn';
import TaskList from './Component/TaskList';

function App() {
  return (
    <>
    <Router>
    <Routes>
    <Route path="/" element={<UserLogin />} />
    <Route path="/signup" element={<UserSignIn />} />
    <Route path="/TaskList" element={<TaskList/>}/>
    </Routes>
    </Router>
    </>
  );
}

export default App;

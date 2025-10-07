import { Route, Switch, Redirect } from 'wouter';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import YourChild from './pages/YourChild';
import PlayBoard from './pages/PlayBoard';
import Recommendations from './pages/Recommendations';
import Shop from './pages/Shop';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AdminPros from './pages/AdminPros';
import ProsDirectory from './pages/ProsDirectory';
import ProProfile from './pages/ProProfile';
import ProEdit from './pages/ProEdit';
import AdminProsManagement from './pages/AdminProsManagement';
import FullQuestionnaire from './pages/FullQuestionnaire';
import QuestionnaireResults from './pages/QuestionnaireResults';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Subscribe from './pages/Subscribe';

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password/:token" component={ResetPassword} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/subscribe" component={Subscribe} />
        <Route path="/your-child" component={YourChild} />
        <Route path="/playboard/:childId" component={PlayBoard} />
        <Route path="/playboard" component={PlayBoard} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/shop" component={Shop} />
        <Route path="/find-pros">
          {() => <Redirect to="/pros" />}
        </Route>
        <Route path="/pros" component={ProsDirectory} />
        <Route path="/pros/:slug" component={ProProfile} />
        <Route path="/pro/edit" component={ProEdit} />
        <Route path="/settings" component={Settings} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin-pros" component={AdminPros} />
        <Route path="/admin/pros-management" component={AdminProsManagement} />
        <Route path="/full-questionnaire/:childId" component={FullQuestionnaire} />
        <Route path="/questionnaire-results/:childId" component={QuestionnaireResults} />
      </Switch>
    </Layout>
  );
}

export default App;

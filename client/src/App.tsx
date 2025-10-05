import { Route, Switch } from 'wouter';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PlayBoard from './pages/PlayBoard';
import Recommendations from './pages/Recommendations';
import Shop from './pages/Shop';
import FindPros from './pages/FindPros';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AdminPros from './pages/AdminPros';
import ProsDirectory from './pages/ProsDirectory';
import ProProfile from './pages/ProProfile';

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/playboard" component={PlayBoard} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/shop" component={Shop} />
        <Route path="/find-pros" component={FindPros} />
        <Route path="/pros" component={ProsDirectory} />
        <Route path="/pros/:slug" component={ProProfile} />
        <Route path="/settings" component={Settings} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin-pros" component={AdminPros} />
      </Switch>
    </Layout>
  );
}

export default App;

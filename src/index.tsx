import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Watcher from './Watcher';
import Broadcaster from './Broadcaster';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/" exact={true} component={App} />
      <Route path="/broadcast" exact={true} component={Broadcaster} />
      <Route path="/watch" component={Watcher} />
    </Switch>
  </ BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { createBrowserHistory } from 'history';
import { bootstrapRedux } from './state/bootstrapRedux';
import { bootstrapIOC } from './ioc/bootstrapIOC';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

// Load favicon
require('images/favicon.ico');

// Load fonts
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Medium.ttf';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Medium.woff2';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Medium.woff';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Light.ttf';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Light.woff2';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Light.woff';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Italic.ttf';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Italic.woff2';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Italic.woff';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Regular.ttf';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Regular.woff2';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Regular.woff';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Bold.ttf';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Bold.woff2';
import '!file-loader?name=[name].[ext]&outputPath=assets/fonts/!./assets/fonts/Roboto-Bold.woff';

const history = createBrowserHistory();
const store = bootstrapRedux({}, history);
bootstrapIOC(store);

const MOUNT_NODE = document.getElementById('app');

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>,
    MOUNT_NODE,
  );
};

if ((module as any).hot) {
  (module as any).hot.accept(['src/components/App'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    render();
  });
}

render();

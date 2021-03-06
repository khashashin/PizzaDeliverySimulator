import { Card, CardActions, CardContent, Typography } from '@mui/material';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import GameListLoadingSkeleton from './components/GameListLoadingSkeleton';
import { Game, IGame, Order, Field, Point } from './models';
import Simulate from './simulate';

type AppProps = any;

interface IAppState {
  games: IGame[];
  loading: boolean;
}

class App extends React.Component<AppProps, IAppState> {
  // get current BrowserWindow
  win = window as any;

  constructor(props: any) {
    super(props);
    this.state = {
      games: [],
      loading: true,
    };

    // resize the window to the size of the game field
    this.win.resizeTo(960, 830);

    fetch('https://lesta.iet-gibb.ch/pizza/api/Spiel', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data: any) => {
        const g: IGame[] = [];
        const maxGames = data.length > 9 ? 9 : data.length;
        for (let i = 0; i < maxGames; i++) {
          g.push(
            new Game(
              data[i].id,
              new Field(data[i].spielfeldX, data[i].spielfeldY),
              new Point(data[i].zentraleX, data[i].zentraleY),
              data[i].maxPizza,
              data[i].maxScooter,
              [],
            ),
          );
        }

        this.setState({
          games: g,
        });

        getAndAssignGameOrders(g);
      })
      .finally(() => {
        setTimeout(() => {
          this.setState({
            loading: false,
          });
        }, 1000);
      });
  }

  render() {
    return (
      <div className="games-list-wrapper">
        {this.state.loading && <GameListLoadingSkeleton />}
        {!this.state.loading &&
          this.state.games.map((game: IGame) => (
            <Card key={game.id} elevation={3}>
              <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  Game {game.id}
                </Typography>
                {game.orders.length > 0 && (
                  <Typography variant="h5" component="div">
                    Pizzas ordered: {game.getAmountOfOrders()}
                  </Typography>
                )}
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Amount of deliveries: {game.maxPizza}
                </Typography>
                <Typography variant="body2">
                  Game width: {game.field.width}
                  <br />
                  Game height: {game.field.height}
                  <br />
                  Position of Store: x{game.store.x} / y{game.store.y}
                </Typography>
              </CardContent>
              <CardActions>
                <Link className="button-link-primary" to={`/simulate`} state={{ ...game }}>
                  Play game {game.id}
                </Link>
              </CardActions>
            </Card>
          ))}
      </div>
    );
  }
}

function getAndAssignGameOrders(gameList: IGame[]) {
  gameList.forEach((game) => {
    fetch(`https://lesta.iet-gibb.ch/pizza/api/Spiel/${game.id}/bestellung`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((orderData: any) => {
        for (let i = 0; i < orderData.length; i++) {
          game.orders.push(
            new Order(
              orderData[i].id,
              orderData[i].spielId,
              orderData[i].zeitpunkt,
              new Point(orderData[i].positionX, orderData[i].positionY),
              orderData[i].anzahl,
              orderData[i].typ,
            ),
          );
        }
      });
  });
}

ReactDOM.render(
  <HashRouter basename="/">
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/main_window" element={<App />} />
      <Route path="/simulate" element={<Simulate />} />
    </Routes>
  </HashRouter>,
  document.getElementById('root'),
);

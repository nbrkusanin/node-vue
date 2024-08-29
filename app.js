const fs = require('fs');
const express = require('express');
const morgan = require('morgan')

const app = express();

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('This is post method');
// });


// MIDLEWARES
app.use(express.json());

app.use(morgan('dev'))

app.use((req, res, next) => {
  console.log('Hello from the midleware 👋')
  next()
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);


// ROUTE HANDLERS
const getAllTours = (req, res) => {
  res.status(200).send({
    status: 'Success',
    results: tours.length + 1,
    requested_at: req.requestTime,
    data: { tours },
  });
};

const getTour = (req, res) => {
  const id = parseInt(req.params.id);
  const tour = tours.find((tour) => tour.id === id);

  if (!tour) {
    return res.status(404).send({
      status: 'Fail',
      message: 'Not found',
    });
  }

  res.status(200).send({
    status: 'Success',
    data: { tour },
  });
};

const createTour = (req, res) => {
  const newId = tours.length;
  const newTour = { ...{ id: newId }, ...req.body };

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status('201').json({
        status: 'Success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const deleteTour = (req, res) => {
  if (parseInt(req.params.id) > tours.length) {
    return res.status(404).send({
      status: 'Fail',
      message: 'Not found',
    });
  }

  res.status(204).send({
    status: 'Success',
    data: null,
  });
};

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.delete('/api/v1/tours/:id', deleteTour);


// ROUTES
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).post(deleteTour);


// START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`Listen on port ${port}...`);
});

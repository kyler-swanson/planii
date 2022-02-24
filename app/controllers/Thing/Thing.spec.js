const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../app');
const Thing = require('../../models/Thing.model');

const { addDaysToDate } = require('../../helpers/DateHelper');

const exampleThing = {
  title: 'Get groceries',
  desc: 'List: eggs, butter, milk, lettuce',
  dueDate: addDaysToDate(new Date(Date.now()), 5),
  state: 'Todo',
  group: 'Household'
};

let testThing;
beforeEach(async () => {
  testThing = new Thing(exampleThing);
  await testThing.save();
});

afterEach(async () => {
  await mongoose.connection.dropCollection('things');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /api/thing', () => {
  test('Get a list of all things', async () => {
    const { body } = await request(app).get('/api/thing');

    expect(body.success).toEqual(true);
    expect(body.things).toEqual([exampleThing]);
  });

  test('Get a list of all things sorted by desc dueDate', async () => {
    const soonThing = {
      title: 'Go for a run',
      dueDate: addDaysToDate(new Date(Date.now()), 1),
      state: 'Todo',
      group: 'Exercise'
    };

    // create a sooner thing
    await request(app).post('/api/thing').send(soonThing);

    const { body } = await request(app).get('/api/thing').send('sort=dueDate&desc=1');

    expect(body.success).toEqual(true);
    expect(body.things).toEqual([soonThing, exampleThing]);
  });

  test('Get a list of all things grouped by group', async () => {
    const householdThing = {
      title: 'Clean the floors',
      dueDate: addDaysToDate(new Date(Date.now()), 3),
      state: 'Todo',
      group: 'Household'
    };

    const exerciseThing = {
      title: 'Go for a run',
      dueDate: addDaysToDate(new Date(Date.now()), 1),
      state: 'Todo',
      group: 'Exercise'
    };

    // create more things
    await request(app).post('/api/thing').send(householdThing);
    await request(app).post('/api/thing').send(exerciseThing);

    const { body } = await request(app).get('/api/thing').send('groupBy=group');

    expect(body.success).toEqual(true);
    expect(body.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: 'Household',
          things: expect.arrayContaining([exampleThing, householdThing])
        })
      ])
    );

    expect(body.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: 'Exercise',
          things: expect.arrayContaining([exerciseThing])
        })
      ])
    );

    //expect(body.groups).toEqual(expect.arrayContaining([expect.objectContaining({ group: 'Exercise' })]));
  });
});

describe('GET /api/thing/:id', () => {
  test('Get a specific thing', async () => {
    const { body } = await request(app).get('/api/thing/' + testThing._id.toString());

    expect(body.success).toEqual(true);
    expect(body.thing).toEqual(exampleThing);
  });
});

describe('POST /api/thing', () => {
  test('Create an incomplete thing', async () => {
    const incomplete = {
      title: 'Finish paper',
      state: 'In progress'
    };

    const { body } = await request(app).post('/api/thing').send(incomplete);

    expect(body.success).toEqual(true);
    expect(body.thing).toEqual({ ...incomplete, group: 'No group' });
  });

  test('Create a complete thing', async () => {
    const completeThing = {
      title: 'Prep for Shopify interview',
      desc: 'Todo: review, review, review',
      dueDate: new Date('March 2, 2022 10:00:00'),
      state: 'In progress',
      group: 'Co-op 2022'
    };

    const { body } = await request(app).post('/api/thing').send(completeThing);

    expect(body.success).toEqual(true);
    expect(body.thing).toEqual(completeThing);
  });

  test('Create thing with invalid dueDate', async () => {
    const invalidThing = {
      ...exampleThing,
      dueDate: addDaysToDate(new Date(Date.now()), -10)
    };

    const { status, body } = await request(app).post('/api/thing').send(invalidThing);

    expect(status).toEqual(400);
    expect(body.success).toEqual(false);
  });

  test('Create thing with no state', async () => {
    const invalidThing = { ...exampleThing };
    delete invalidThing.state;

    const { status, body } = await request(app).post('/api/thing').send(invalidThing);

    expect(status).toEqual(400);
    expect(body.success).toEqual(false);
  });
});

describe('PATCH /api/item/:id', () => {
  test("Update a things's state", async () => {
    const { body } = await request(app)
      .patch('/api/thing/' + testThing._id.toString())
      .send({ state: 'In progress' });

    expect(body.success).toEqual(true);
    expect(body.thing).toEqual({ ...exampleThing, state: 'In progress' });
  });
});

describe('DELETE /api/thing/:id', () => {
  test('Delete a thing', async () => {
    const { body } = await request(app).delete('/api/thing/' + testThing._id.toString());

    expect(body.success).toEqual(true);
    expect(body.thing).toEqual(exampleThing);
  });
});

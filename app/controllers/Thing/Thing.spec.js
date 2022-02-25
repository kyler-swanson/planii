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
    expect(body.things[0]).toMatchObject(exampleThing);
  });

  test('Get a list of all things sorted by asc dueDate', async () => {
    const soonThing = {
      title: 'Go for a run',
      dueDate: addDaysToDate(new Date(Date.now()), 1),
      state: 'Todo',
      group: 'Exercise'
    };

    // create a sooner thing
    await new Thing(soonThing).save();

    const { body } = await request(app).get('/api/thing').query({ sort: 'dueDate', order: 'asc' });

    expect(body.success).toEqual(true);

    expect(body.things[0]).toMatchObject(soonThing);
    expect(body.things[1]).toMatchObject(exampleThing);
  });

  test('Get a list of all things sorted dueDate and default order (desc)', async () => {
    const soonThing = {
      title: 'Go for a run',
      dueDate: addDaysToDate(new Date(Date.now()), 1),
      state: 'Todo',
      group: 'Exercise'
    };

    // create a sooner thing
    await new Thing(soonThing).save();

    const { body } = await request(app).get('/api/thing').query({ sort: 'dueDate' });

    expect(body.success).toEqual(true);

    expect(body.things[0]).toMatchObject(exampleThing);
    expect(body.things[1]).toMatchObject(soonThing);
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
    await new Thing(householdThing).save();
    await new Thing(exerciseThing).save();

    const { body } = await request(app).get('/api/thing').query({ groupBy: 'group' });
    expect(body.success).toEqual(true);
    expect(body.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: 'Household',
          things: expect.arrayContaining([expect.objectContaining(exampleThing), expect.objectContaining(householdThing)])
        })
      ])
    );

    expect(body.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: 'Exercise',
          things: expect.arrayContaining([expect.objectContaining(exerciseThing)])
        })
      ])
    );
  });
});

describe('GET /api/thing/:id', () => {
  test('Get a specific thing', async () => {
    const { body } = await request(app).get('/api/thing/' + testThing._id.toString());

    expect(body.success).toEqual(true);
    expect(body.thing).toMatchObject(exampleThing);
  });

  test("Get a specific thing with an invalid ID/doesn't exist", async () => {
    const { body } = await request(app).get('/api/thing/c7sn2ba');

    expect(body.success).toEqual(false);
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
    expect(body.thing).toMatchObject({ ...incomplete, group: 'No group' });
  });

  test('Create a complete thing', async () => {
    const completeThing = {
      title: 'Prep for Shopify interview',
      desc: 'Todo: review, review, review',
      dueDate: new Date('March 2, 2022 10:00:00').toISOString(),
      state: 'In progress',
      group: 'Co-op 2022'
    };

    const { body } = await request(app).post('/api/thing').send(completeThing);

    expect(body.success).toEqual(true);
    expect(body.thing).toMatchObject(completeThing);
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
    expect(body.thing).toMatchObject({ ...exampleThing, state: 'In progress' });
  });

  test("Update an invalid things's state", async () => {
    const { body } = await request(app).patch('/api/thing/1234').send({ state: 'In progress' });

    expect(body.success).toEqual(false);
  });
});

describe('DELETE /api/thing/:id', () => {
  test('Delete a thing', async () => {
    const { body } = await request(app).delete('/api/thing/' + testThing._id.toString());

    expect(body.success).toEqual(true);
    expect(body.thing).toMatchObject(exampleThing);
  });
});

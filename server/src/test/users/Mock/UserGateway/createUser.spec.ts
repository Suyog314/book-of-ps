import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { INode, makeINode, IUser, makeIUser } from "../../../../types";
import { BackendUserGateway } from "../../../../users";

describe("Unit Test: Create user", () => {
  let uri: string;
  let mongoClient: MongoClient;
  let backendUserGateway: BackendUserGateway;
  let mongoMemoryServer: MongoMemoryServer;

  const testUserName = "testName";
  const testUserEmail = "test@test.com";
  const testPassword = "test123";
  const testId = "123456789";

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    backendUserGateway = new BackendUserGateway(mongoClient);
    mongoClient.connect();
  });

  beforeEach(async () => {
    const response = await backendUserGateway.deleteAll();
    expect(response.success).toBeTruthy();
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoMemoryServer.stop();
  });

  test("inserts valid user", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const response = await backendUserGateway.createUser(validUser);
    expect(response.success).toBeTruthy();
    expect(response.payload).toStrictEqual(validUser);
  });

  test("fails to insert user with duplicate id", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const validResponse = await backendUserGateway.createUser(validUser);

    expect(validResponse.success).toBeTruthy();
    const invalidUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const invalidResponse = await backendUserGateway.createUser(invalidUser);
    expect(invalidResponse.success).toBeFalsy();
  });

  test("fails to insert user when type is of invalid type", async () => {
    const invalidUser: INode = makeINode(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const response = await backendUserGateway.createUser(invalidUser);
    expect(response.success).toBeFalsy();
  });
});

import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { IUser, makeIUser } from "../../../../types";
import { UserCollectionConnection } from "../../../../users";

describe("Unit Test: findUsersById", () => {
  let uri: string;
  let mongoClient: MongoClient;
  let userCollectionConnection: UserCollectionConnection;
  let mongoMemoryServer: MongoMemoryServer;

  const testUserName = "testName";
  const testUserEmail = "test@test.com";
  const testPassword = "test123";

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    userCollectionConnection = new UserCollectionConnection(mongoClient);
    mongoClient.connect();
  });

  beforeEach(async () => {
    const response = await userCollectionConnection.clearUserCollection();
    expect(response.success).toBeTruthy();
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoMemoryServer.stop();
  });

  test("gets nodes when given valid ids", async () => {
    const validUser1: IUser = makeIUser(
      testUserName + "1",
      testUserEmail + "1",
      testPassword + "1",
      "1"
    );
    const validUser2: IUser = makeIUser(
      testUserName + "2",
      testUserEmail + "2",
      testPassword + "2",
      "2"
    );
    const createResponse1 = await userCollectionConnection.insertUser(
      validUser1
    );
    const createResponse2 = await userCollectionConnection.insertUser(
      validUser2
    );
    expect(createResponse1.success).toBeTruthy();
    expect(createResponse2.success).toBeTruthy();
    const findUsersByIdResp = await userCollectionConnection.findUsersById([
      validUser1.userId,
      validUser2.userId,
    ]);
    expect(findUsersByIdResp.success).toBeTruthy();
    expect(findUsersByIdResp.payload.length).toBe(2);
  });

  test("success when some nodes are not found", async () => {
    const validUser1: IUser = makeIUser(
      testUserName + "1",
      testUserEmail + "1",
      testPassword + "1",
      "1"
    );
    const createResponse = await userCollectionConnection.insertUser(
      validUser1
    );
    expect(createResponse.success).toBeTruthy();
    const findUsersByIdResp = await userCollectionConnection.findUsersById([
      "1",
      "2",
    ]);
    expect(findUsersByIdResp.success).toBeTruthy();
    expect(findUsersByIdResp.payload.length).toBe(1);
  });

  test("success when nodes are not found", async () => {
    const validUser1: IUser = makeIUser(
      testUserName + "1",
      testUserEmail + "1",
      testPassword + "1",
      "1"
    );
    const createResponse = await userCollectionConnection.insertUser(
      validUser1
    );
    expect(createResponse.success).toBeTruthy();
    const findNodesByIdResp = await userCollectionConnection.findUsersById([
      "2",
    ]);
    expect(findNodesByIdResp.success).toBeTruthy();
    expect(findNodesByIdResp.payload.length).toBe(0);
  });
});

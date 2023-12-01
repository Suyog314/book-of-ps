import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { IUser, makeIUser } from "../../../../types";
import { UserCollectionConnection } from "../../../../users";

describe("Unit Test: findUserById", () => {
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

  afterAll(async () => {
    await mongoClient.close();
    await mongoMemoryServer.stop();
  });

  test("gets user when given valid id", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      "1"
    );
    const createResponse = await userCollectionConnection.insertUser(validUser);
    expect(createResponse.success).toBeTruthy();
    const findUserByIdResp = await userCollectionConnection.findUserById(
      validUser.userId
    );
    expect(findUserByIdResp.success).toBeTruthy();
  });

  test("fails to get user when given invalid id", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      "1"
    );
    const createResponse = await userCollectionConnection.insertUser(validUser);
    expect(createResponse.success).toBeTruthy();
    const findUserByIdResp = await userCollectionConnection.findUserById("2");
    expect(findUserByIdResp.success).toBeFalsy();
  });
});

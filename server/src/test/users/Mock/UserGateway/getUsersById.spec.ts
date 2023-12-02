import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { IUser, makeIUser } from "../../../../types";
import { BackendUserGateway } from "../../../../users";

describe("Unit Test: Get Users By Id", () => {
  let uri: string;
  let mongoClient: MongoClient;
  let backendUserGateway: BackendUserGateway;
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

  test("gets user when given valid id", async () => {
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
    const response1 = await backendUserGateway.createUser(validUser1);
    const response2 = await backendUserGateway.createUser(validUser2);
    expect(response1.success).toBeTruthy();
    expect(response2.success).toBeTruthy();
    const getUsersByIdResp = await backendUserGateway.getUsersById([
      validUser1.userId,
      validUser2.userId,
    ]);
    expect(getUsersByIdResp.success).toBeTruthy();
    expect(getUsersByIdResp.payload.length).toBe(2);
  });

  test("success when some users are not found", async () => {
    const validUser1: IUser = makeIUser(
      testUserName + "1",
      testUserEmail + "1",
      testPassword + "1",
      "1"
    );
    const createResponse = await backendUserGateway.createUser(validUser1);
    expect(createResponse.success).toBeTruthy();
    const findUsersByIdResp = await backendUserGateway.getUsersById(["1", "2"]);
    expect(findUsersByIdResp.success).toBeTruthy();
    expect(findUsersByIdResp.payload.length).toBe(1);
  });

  test("success when users are not found", async () => {
    const validUser1: IUser = makeIUser(
      testUserName + "1",
      testUserEmail + "1",
      testPassword + "1",
      "1"
    );
    const createResponse = await backendUserGateway.createUser(validUser1);
    expect(createResponse.success).toBeTruthy();
    const findNodesByIdResp = await backendUserGateway.getUsersById(["2"]);
    expect(findNodesByIdResp.success).toBeTruthy();
    expect(findNodesByIdResp.payload.length).toBe(0);
  });
});

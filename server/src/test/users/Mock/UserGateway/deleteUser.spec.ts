import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { IUser, makeIUser } from "../../../../types";
import { BackendUserGateway } from "../../../../users";

describe("Unit Test: Delete User By Id", () => {
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

  test("successfully deletes user", async () => {
    const validUser1: IUser = makeIUser(
      testUserName + "1",
      testUserEmail + "1",
      testPassword + "1",
      "1"
    );
    const response1 = await backendUserGateway.createUser(validUser1);
    expect(response1.success).toBeTruthy();
    const deleteResp = await backendUserGateway.deleteUser("1");
    expect(deleteResp.success).toBeTruthy();
    const findNode1Resp = await backendUserGateway.getUserById("1");
    expect(findNode1Resp.success).toBeFalsy();
  });

  test("successfully deletes correct user", async () => {
    const validUser1: IUser = makeIUser(
      testUserName + "1",
      testUserEmail + "1",
      testPassword + "1",
      "1"
    );
    const response1 = await backendUserGateway.createUser(validUser1);
    expect(response1.success).toBeTruthy();

    const validUser2: IUser = makeIUser(
      testUserName + "2",
      testUserEmail + "2",
      testPassword + "2",
      "2"
    );
    const response2 = await backendUserGateway.createUser(validUser2);
    expect(response2.success).toBeTruthy();

    const deleteResp = await backendUserGateway.deleteUser("2");
    expect(deleteResp.success).toBeTruthy();

    const findNode1Resp = await backendUserGateway.getUserById("2");
    expect(findNode1Resp.success).toBeFalsy();
    const findNode2Resp = await backendUserGateway.getUserById("1");
    expect(findNode2Resp.success).toBeTruthy();
  });

  test("fails on user doesn't exist", async () => {
    const validUser1: IUser = makeIUser(
      testUserName + "1",
      testUserEmail + "1",
      testPassword + "1",
      "1"
    );
    const response1 = await backendUserGateway.createUser(validUser1);
    expect(response1.success).toBeTruthy();

    const deleteResp = await backendUserGateway.deleteUser("2");
    expect(deleteResp.success).toBeTruthy();

    const findNode1Resp = await backendUserGateway.getUserById("1");
    expect(findNode1Resp.success).toBeTruthy();
  });
});

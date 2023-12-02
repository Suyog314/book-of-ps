import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { IUser, makeIUser } from "../../../../types";
import { BackendUserGateway } from "../../../../users";

describe("Unit Test: Delete All", () => {
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

  afterAll(async () => {
    await mongoClient.close();
    await mongoMemoryServer.stop();
  });

  test("successfully deletes all users", async () => {
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

    const validUser3: IUser = makeIUser(
      testUserName + "3",
      testUserEmail + "3",
      testPassword + "3",
      "3"
    );
    const response3 = await backendUserGateway.createUser(validUser3);
    expect(response3.success).toBeTruthy();

    const deleteAllResp = await backendUserGateway.deleteAll();
    expect(deleteAllResp.success).toBeTruthy();

    const findNode1Resp = await backendUserGateway.getUserById("1");
    expect(findNode1Resp.success).toBeFalsy();
    const findNode2Resp = await backendUserGateway.getUserById("2");
    expect(findNode2Resp.success).toBeFalsy();
    const findNode3Resp = await backendUserGateway.getUserById("3");
    expect(findNode3Resp.success).toBeFalsy();
  });
});

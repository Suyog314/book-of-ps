import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { IUser, makeIUser } from "../../../../types";
import { BackendUserGateway } from "../../../../users";

describe("Unit Test: Get User By Email", () => {
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

  test("gets user when given valid email", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const response = await backendUserGateway.createUser(validUser);
    expect(response.success).toBeTruthy();
    const getUserByIdResp = await backendUserGateway.getUserByEmail(
      validUser.email
    );
    expect(getUserByIdResp.success).toBeTruthy();
  });

  test("fails to get user when given invalid email", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const createResponse = await backendUserGateway.createUser(validUser);
    expect(createResponse.success).toBeTruthy();
    const getNodeByIdResp = await backendUserGateway.getUserByEmail("2");
    expect(getNodeByIdResp.success).toBeFalsy();
  });
});

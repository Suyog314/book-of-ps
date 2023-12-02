import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { INode, makeINode, IUser, makeIUser } from "../../../../types";
import { BackendUserGateway } from "../../../../users";

describe("Unit Test: Authenticate User", () => {
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

  test("Authenticates valid user", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const response = await backendUserGateway.createUser(validUser);
    expect(response.success).toBeTruthy();
    const authResp = await backendUserGateway.authenticateUser(
      validUser.email,
      validUser.password
    );
    console.log(authResp.message);
    expect(authResp.success).toBeTruthy();
    expect(authResp.payload.name).toEqual(testUserName);
    expect(authResp.payload.name).toEqual(testUserEmail);
    expect(authResp.payload.backendTokens).toBeDefined();
  });

  test("Fails authentication for invalid email", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const response = await backendUserGateway.createUser(validUser);
    expect(response.success).toBeTruthy();
    const authResp = await backendUserGateway.authenticateUser(
      "1",
      validUser.password
    );
    expect(authResp.success).toBeFalsy();
  });

  test("Fails authentication for invalid password", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const response = await backendUserGateway.createUser(validUser);
    expect(response.success).toBeTruthy();
    const authResp = await backendUserGateway.authenticateUser(
      validUser.email,
      "1"
    );
    expect(authResp.success).toBeFalsy();
  });

  test("Fails authentication for invalid email and password", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      testId
    );
    const response = await backendUserGateway.createUser(validUser);
    expect(response.success).toBeTruthy();
    const authResp = await backendUserGateway.authenticateUser("asdfdsaf", "1");
    expect(authResp.success).toBeFalsy();
  });
});

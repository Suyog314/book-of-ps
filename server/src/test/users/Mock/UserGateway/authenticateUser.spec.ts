import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { IUser, makeIUser } from "../../../../types";
import { BackendUserGateway } from "../../../../users";
import bcrypt from "bcryptjs";

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
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      hashedPassword,
      testId
    );

    const response = await backendUserGateway.createUser(validUser);
    expect(response.success).toBeTruthy();
    const authResp = await backendUserGateway.authenticateUser(
      validUser.email,
      testPassword
    );
    expect(authResp.success).toBeTruthy();
    expect(authResp.payload.name).toEqual(testUserName);
    expect(authResp.payload.email).toEqual(testUserEmail);
    expect(authResp.payload.backendTokens).toBeDefined();
  });

  test("Fails authentication for invalid email", async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      hashedPassword,
      testId
    );
    const response = await backendUserGateway.createUser(validUser);
    expect(response.success).toBeTruthy();
    const authResp = await backendUserGateway.authenticateUser(
      "1",
      testPassword
    );
    expect(authResp.success).toBeFalsy();
  });

  test("Fails authentication for invalid password", async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      hashedPassword,
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
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      hashedPassword,
      testId
    );
    const response = await backendUserGateway.createUser(validUser);
    expect(response.success).toBeTruthy();
    const authResp = await backendUserGateway.authenticateUser("asdfdsaf", "1");
    expect(authResp.success).toBeFalsy();
  });
});

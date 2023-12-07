import { MongoClient } from "mongodb";
import { BackendUserGateway } from "../../../users";
import { IUser, makeIUser } from "../../../types";
import { v4 as uuidv4 } from "uuid";

jest.setTimeout(50000);

describe("E2E Test: User CRUD", () => {
  let mongoClient: MongoClient;
  let backendUserGateway: BackendUserGateway;
  let uri: string;
  let collectionName: string;

  const userId = uuidv4();

  const testUser: IUser = makeIUser(
    "testName",
    "testEmail",
    "testPassword",
    userId
  );

  beforeAll(async () => {
    uri = process.env.DB_URI;
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    collectionName = "e2e-test-user";
    backendUserGateway = new BackendUserGateway(mongoClient, collectionName);
    await mongoClient.connect();
    const getResponse = await backendUserGateway.getUserById(testUser.userId);
    expect(getResponse.success).toBeFalsy();
  });

  afterAll(async () => {
    await mongoClient.db().collection(collectionName).drop();
    const getResponse = await backendUserGateway.getUserById(testUser.userId);
    expect(getResponse.success).toBeFalsy();
    await mongoClient.close();
  });

  test("creates user", async () => {
    const response = await backendUserGateway.createUser(testUser);
    expect(response.success).toBeTruthy();
  });

  test("retrieves user", async () => {
    const response = await backendUserGateway.getUserById(testUser.userId);
    expect(response.success).toBeTruthy();
    expect(response.payload.userId).toEqual(testUser.userId);
  });

  test("deletes user", async () => {
    const deleteResponse = await backendUserGateway.deleteUser(testUser.userId);
    expect(deleteResponse.success).toBeTruthy();

    const getResponse = await backendUserGateway.getUserById(testUser.userId);
    expect(getResponse.success).toBeFalsy();
  });
});

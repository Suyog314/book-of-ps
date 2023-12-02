import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { IUser, makeIUser } from "../../../../types";
import { UserCollectionConnection } from "../../../../users";

describe("Unit Test: insertUser", () => {
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

  test("inserts user", async () => {
    const validUser: IUser = makeIUser(
      testUserName,
      testUserEmail,
      testPassword,
      "1"
    );
    const response = await userCollectionConnection.insertUser(validUser);
    expect(response.success).toBeTruthy();
  });

  test("fails to insert invalid document with wrong shape", async () => {
    const invalidUser = { userId: "id" } as unknown as IUser;
    const response = await userCollectionConnection.insertUser(invalidUser);
    expect(response.success).toBeFalsy();
  });
});

import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BackendNodeGateway } from "../../../../nodes";

describe("Unit Test: Get User Recipes", () => {
  let uri: string;
  let mongoClient: MongoClient;
  let backendNodeGateway: BackendNodeGateway;
  let mongoMemoryServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    backendNodeGateway = new BackendNodeGateway(mongoClient);
    mongoClient.connect();
  });

  beforeEach(async () => {
    const response = await backendNodeGateway.deleteAll();
    expect(response.success).toBeTruthy();
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoMemoryServer.stop();
  });

  test("success when no roots exist (empty database)", async () => {
    const userId = "userId";
    const userEmail = "user@gmail.com";
    const getResponse = await backendNodeGateway.getUserRecipes(
      userId,
      userEmail
    );
    expect(getResponse.success).toBeTruthy();
  });
});

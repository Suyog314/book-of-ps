import {
  Cuisine,
  INode,
  IRecipeNode,
  isSameNode,
  makeINode,
  makeIRecipeNode,
} from "../../../../types";
import { NodeCollectionConnection } from "../../../../nodes";

import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Unit Test: findUserRecipes", () => {
  let uri: string;
  let mongoClient: MongoClient;
  let nodeCollectionConnection: NodeCollectionConnection;
  let mongoMemoryServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    nodeCollectionConnection = new NodeCollectionConnection(mongoClient);
    mongoClient.connect();
  });

  beforeEach(async () => {
    const response = await nodeCollectionConnection.clearNodeCollection();
    expect(response.success).toBeTruthy();
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoMemoryServer.stop();
  });

  test("finds valid root recipes", async () => {
    const descriptionId: string = "descriptionId";
    const stepsId: string = "stepId";
    const ingredientsId: string = "ing1";
    const serving: number = 4;
    const cuisine: Cuisine = "Korean";
    const time: number = 9;

    const authorId: string = "authorId";
    const userEmail: string = "user@gmail.com";
    const validNode1: IRecipeNode = makeIRecipeNode(
      "1",
      ["1"],
      descriptionId,

      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      authorId,
      [],
      "recipe"
    );
    const validNode2: IRecipeNode = makeIRecipeNode(
      "2",
      ["2"],
      descriptionId,

      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      authorId,
      ["3", "4"],
      "recipe"
    );
    const validNode3: IRecipeNode = makeIRecipeNode(
      "3",
      ["2", "3"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      authorId,
      ["5"],
      "recipe"
    );
    const createResponse1 = await nodeCollectionConnection.insertNode(
      validNode1
    );
    expect(createResponse1.success).toBeTruthy();
    const createResponse2 = await nodeCollectionConnection.insertNode(
      validNode2
    );
    expect(createResponse2.success).toBeTruthy();
    const createResponse3 = await nodeCollectionConnection.insertNode(
      validNode3
    );
    expect(createResponse3.success).toBeTruthy();
    const findRootsResp = await nodeCollectionConnection.findUserRecipes(
      authorId,
      userEmail
    );
    expect(findRootsResp.success).toBeTruthy();
    expect(findRootsResp.payload.length).toBe(2);
    const node1 = findRootsResp.payload.find(
      (node: { nodeId: string }) => node.nodeId === "1"
    );
    expect(isSameNode(node1, validNode1)).toBeTruthy();
    const node2 = findRootsResp.payload.find(
      (node: { nodeId: string }) => node.nodeId === "2"
    );
    expect(isSameNode(node2, validNode2)).toBeTruthy();
  });

  test("finds only recipe nodes", async () => {
    const descriptionId: string = "descriptionId";
    const stepsId: string = "stepId";
    const ingredientsId: string = "ing1";
    const serving: number = 4;
    const cuisine: Cuisine = "Korean";
    const time: number = 9;

    const authorId: string = "authorId";
    const userEmail: string = "user@gmail.com";
    const validNode1: IRecipeNode = makeIRecipeNode(
      "1",
      ["1"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      authorId,
      [],
      "recipe"
    );
    const validNode2: INode = makeINode("2", ["2"], ["3", "4"], "text");
    const validNode3: INode = makeINode("3", ["3"], ["5"], "image");
    const createResponse1 = await nodeCollectionConnection.insertNode(
      validNode1
    );
    expect(createResponse1.success).toBeTruthy();
    const createResponse2 = await nodeCollectionConnection.insertNode(
      validNode2
    );
    expect(createResponse2.success).toBeTruthy();
    const createResponse3 = await nodeCollectionConnection.insertNode(
      validNode3
    );
    expect(createResponse3.success).toBeTruthy();
    const findRootsResp = await nodeCollectionConnection.findUserRecipes(
      authorId,
      userEmail
    );
    expect(findRootsResp.success).toBeTruthy();
    expect(findRootsResp.payload.length).toBe(1);
    const node1 = findRootsResp.payload.find(
      (node: { nodeId: string }) => node.nodeId === "1"
    );
    expect(isSameNode(node1, validNode1)).toBeTruthy();
  });

  test("finds only recipe nodes that user created", async () => {
    const descriptionId: string = "descriptionId";
    const stepsId: string = "stepId";
    const ingredientsId: string = "ing1";
    const serving: number = 4;
    const cuisine: Cuisine = "Korean";
    const time: number = 9;

    const authorId: string = "authorId";
    const userEmail: string = "user@gmail.com";

    const validNode1: IRecipeNode = makeIRecipeNode(
      "1",
      ["1"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      authorId,
      [],
      "recipe"
    );
    const validNode2: IRecipeNode = makeIRecipeNode(
      "2",
      ["2"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      "notSameId",
      ["3", "4"],
      "recipe"
    );
    const validNode3: IRecipeNode = makeIRecipeNode(
      "3",
      ["3"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      "notSameId2",
      ["5"],
      "recipe"
    );
    const createResponse1 = await nodeCollectionConnection.insertNode(
      validNode1
    );
    expect(createResponse1.success).toBeTruthy();
    const createResponse2 = await nodeCollectionConnection.insertNode(
      validNode2
    );
    expect(createResponse2.success).toBeTruthy();
    const createResponse3 = await nodeCollectionConnection.insertNode(
      validNode3
    );
    expect(createResponse3.success).toBeTruthy();
    const findRootsResp = await nodeCollectionConnection.findUserRecipes(
      authorId,
      userEmail
    );
    expect(findRootsResp.success).toBeTruthy();
    expect(findRootsResp.payload.length).toBe(1);
    const node1 = findRootsResp.payload.find(
      (node: { nodeId: string }) => node.nodeId === "1"
    );
    expect(isSameNode(node1, validNode1)).toBeTruthy();
  });

  test("finds only recipe nodes that are shared with the user", async () => {
    const descriptionId: string = "descriptionId";
    const stepsId: string = "stepId";
    const ingredientsId: string = "ing1";
    const serving: number = 4;
    const cuisine: Cuisine = "Korean";
    const time: number = 9;

    const authorId: string = "authorId";
    const userEmail: string = "user@gmail.com";

    const validNode1: IRecipeNode = makeIRecipeNode(
      "1",
      ["1"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      "notSameId",
      [],
      "recipe",
      "title",
      "content",
      undefined,
      undefined,
      ["andynorm@gmail.com", "user@gmail.com"]
    );
    const validNode2: IRecipeNode = makeIRecipeNode(
      "2",
      ["2"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      "notSameId2",
      ["3", "4"],
      "recipe",
      "title",
      "content",
      undefined,
      undefined,
      ["user@gmail.com"]
    );
    const validNode3: IRecipeNode = makeIRecipeNode(
      "3",
      ["3"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      "notSameId3",
      ["5"],
      "recipe",
      "title",
      "content",
      undefined,
      undefined,
      []
    );
    const validNode4: IRecipeNode = makeIRecipeNode(
      "4",
      ["4"],
      descriptionId,
      ingredientsId,
      stepsId,
      serving,
      cuisine,
      time,
      "notSameId4",
      ["hi"],
      "recipe",
      "title",
      "content",
      undefined,
      undefined,
      ["123@gmail.com"]
    );
    const createResponse1 = await nodeCollectionConnection.insertNode(
      validNode1
    );
    expect(createResponse1.success).toBeTruthy();
    const createResponse2 = await nodeCollectionConnection.insertNode(
      validNode2
    );
    expect(createResponse2.success).toBeTruthy();
    const createResponse3 = await nodeCollectionConnection.insertNode(
      validNode3
    );
    expect(createResponse3.success).toBeTruthy();
    const createResponse4 = await nodeCollectionConnection.insertNode(
      validNode4
    );
    expect(createResponse4.success).toBeTruthy();
    const findRootsResp = await nodeCollectionConnection.findUserRecipes(
      authorId,
      userEmail
    );
    expect(findRootsResp.success).toBeTruthy();
    expect(findRootsResp.payload.length).toBe(2);
    const node1 = findRootsResp.payload.find(
      (node: { nodeId: string }) => node.nodeId === "1"
    );
    expect(isSameNode(node1, validNode1)).toBeTruthy();
    const node2 = findRootsResp.payload.find(
      (node: { nodeId: string }) => node.nodeId === "2"
    );
    expect(isSameNode(node2, validNode2)).toBeTruthy();
  });

  test("still success response when no roots found", async () => {
    const authorId: string = "authorId";
    const userEmail: string = "user@gmail.com";
    const findRootsResp = await nodeCollectionConnection.findUserRecipes(
      authorId,
      userEmail
    );
    expect(findRootsResp.success).toBeTruthy();
  });
});

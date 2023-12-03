import { MongoClient } from "mongodb";
import {
  failureServiceResponse,
  IServiceResponse,
  successfulServiceResponse,
  IUser,
  isIUser,
  makeIUserSession,
  IUserSession,
} from "../types";
import { UserCollectionConnection } from "./UserCollectionConnection";
import bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

/**
 * BackendNodeGateway handles requests from NodeRouter, and calls on methods
 * in NodeCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 *
 * Example:
 * Before insertion, BackendNodeGateway.createNode() will check whether the database
 * already contains a node with the same nodeId, as well as the the validity of
 * node's file path. In comparison, the NodeCollectionConnection.insertNode()
 * method simply retrieves the node object, and inserts it into the database.
 */
export class BackendUserGateway {
  userCollectionConnection: UserCollectionConnection;
  EXPIRE_TIME: number;
  jwtService: JwtService;

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.userCollectionConnection = new UserCollectionConnection(
      mongoClient,
      collectionName ?? "users"
    );
    this.EXPIRE_TIME = 10800000;
    this.jwtService = new JwtService();
  }

  /**
   * Method to create a user and insert it into the database.
   *
   * @param userId - The userId of the user to be created.
   */
  async createUser(user: any): Promise<IServiceResponse<IUser>> {
    // check whether is valid Node
    const isValidUser = isIUser(user);
    if (!isValidUser) {
      return failureServiceResponse("Not a valid user.");
    }
    // check whether already in database
    const userResponse = await this.userCollectionConnection.findUserById(
      user.userId
    );
    if (userResponse.success) {
      return failureServiceResponse("User already exist in database.");
    }
    const emailResponse = await this.userCollectionConnection.findUserByEmail(
      user.email
    );
    if (emailResponse.success) {
      return failureServiceResponse("Email already used.");
    }
    // if everything checks out, insert node
    const insertUserResp = await this.userCollectionConnection.insertUser(user);
    return insertUserResp;
  }

  /**
   * Method to authenticate a user
   *
   * @param userEmail - The email of the user to be authenticated.
   * @param userPassword - The password of the user to be authenticated.
   */
  async authenticateUser(
    email: any,
    password: any
  ): Promise<IServiceResponse<IUserSession>> {
    if (typeof email !== "string" || typeof password !== "string") {
      return failureServiceResponse("Email and password provided not strings.");
    }
    // check whether already in database
    const userResponse = await this.userCollectionConnection.findUserByEmail(
      email
    );
    if (!userResponse.success) {
      return failureServiceResponse("User not in database.");
    }
    // const hashedPassword = await bcrypt.hash(password, 10);
    // make sure passwords match
    const passwordsMatch = await bcrypt.compare(
      password,
      userResponse.payload.password
    );
    console.log(passwordsMatch);
    if (!passwordsMatch) {
      return failureServiceResponse("Passwords do not match.");
    }
    const jwtService = new JwtService();
    const backendTokens = {
      accessToken: await jwtService.signAsync(userResponse.payload, {
        expiresIn: "3h",
        secret: process.env.JWTSECRETKEY,
      }),
      refreshToken: await jwtService.signAsync(userResponse.payload, {
        expiresIn: "7d",
        secret: process.env.JWTREFRESHTOKENKEY,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + this.EXPIRE_TIME),
    };
    const user = userResponse.payload;
    const userSession = makeIUserSession(
      user.name,
      user.email,
      user.userId,
      backendTokens
    );
    return successfulServiceResponse(userSession);
  }

  /**
   * Refreshes the backend tokens of the user
   *
   * @param userID - userId of the user
   * @returns Promise<IServiceResponse<IUserSession>> - contains the refreshed tokens
   */
  async refreshToken(userId: string): Promise<IServiceResponse<IUserSession>> {
    // check whether already in database
    const userResponse = await this.userCollectionConnection.findUserById(
      userId
    );
    if (!userResponse.success) {
      return failureServiceResponse("User not in database.");
    }
    const backendTokens = {
      accessToken: await this.jwtService.signAsync(userResponse.payload, {
        expiresIn: "3h",
        secret: process.env.jwtSecretKey,
      }),
      refreshToken: await this.jwtService.signAsync(userResponse.payload, {
        expiresIn: "7d",
        secret: process.env.jwtRefreshTokenKey,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + this.EXPIRE_TIME),
    };
    const user = userResponse.payload;
    const userSession = makeIUserSession(
      user.name,
      user.email,
      user.userId,
      backendTokens
    );
    return successfulServiceResponse(userSession);
  }

  /**
   * Method to find a user
   *
   * @param userId - The userId of the user to get.
   */
  async getUserById(userId: string): Promise<IServiceResponse<IUser>> {
    return this.userCollectionConnection.findUserById(userId);
  }

  /**
   * Method to find a list of users
   *
   * @param userId[] - The userId's of the user to get.
   */
  async getUsersById(userIds: string[]): Promise<IServiceResponse<IUser[]>> {
    return this.userCollectionConnection.findUsersById(userIds);
  }

  /**
   * Method to find a user by email
   *
   * @param userEmail - The email of the user to look for
   */
  async getUserByEmail(userEmail: string): Promise<IServiceResponse<IUser>> {
    return this.userCollectionConnection.findUserByEmail(userEmail);
  }

  /**
   * Method to delete all users from the collection
   *
   */
  async deleteAll(): Promise<IServiceResponse<null>> {
    return await this.userCollectionConnection.clearUserCollection();
  }
}

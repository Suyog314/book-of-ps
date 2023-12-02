import {
  failureServiceResponse,
  INode,
  IServiceResponse,
  IUser,
  IUserSession,
} from "../types";
import { endpoint, get, post, put, remove } from "../global";

/** In development mode (locally) the server is at localhost:8000*/
const baseEndpoint = endpoint;

/** This is the path to the nodes microservice */
const servicePath = "user/";

/**
 * FrontendRegisterGateway handles HTTP requests to the host, which is located on
 * the server. This FrontendRegisterGateway object uses the baseEndpoint, and
 * additional server information to access the requested information.
 *
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const FrontendUserGateway = {
  createUser: async (user: IUser): Promise<IServiceResponse<IUser>> => {
    try {
      return await post<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + "create",
        {
          user: user,
        }
      );
    } catch (exception) {
      return failureServiceResponse("[createUser] Unable to access backend");
    }
  },

  findUserByEmail: async (email: string): Promise<IServiceResponse<IUser>> => {
    try {
      return await post<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + "getByEmail",
        {
          email: email,
        }
      );
    } catch (exception) {
      return failureServiceResponse(
        "[findUserByEmail] Unable to access backend"
      );
    }
  },

  authenticateUser: async (
    email: string,
    password: string
  ): Promise<IServiceResponse<IUserSession>> => {
    try {
      return await post<IServiceResponse<IUserSession>>(
        baseEndpoint + servicePath + "authenticate",
        {
          email: email,
          password: password,
        }
      );
    } catch (exception) {
      return failureServiceResponse(
        "[findUserByEmail] Unable to access backend"
      );
    }
  },
};

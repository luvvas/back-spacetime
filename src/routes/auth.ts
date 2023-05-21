import axios from "axios";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

// This function handles the registration process by
// exchanging a code received from the client with an
// access token from the GitHub API. It then fetches user
// data using the access token and validates the received
// user data before sending it back in the response
export async function authRoute(app: FastifyInstance) {
  app.post('/register', async (req) => {
    // this specifies that the request body should contain
    // a property named `code` with a string value
    const bodySchema = z.object({
      code: z.string()
    })

    // validates `code` value from the request body using
    // the `bodySchema`
    const { code } = bodySchema.parse(req.body)

    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        // the parameters are used to authenticate and exchange
        // the code received from the client for an access token
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        // this indicates that the API's response should be with
        // JSON data
        headers: {
          Accept: 'application/json'
        }
      }
    )

    // access_token extracted from the response data
    const { access_token } = accessTokenResponse.data

    // response data containing user information is stored
    // in the `userResponse`
    const userResponse = await axios.get('http://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })

    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url()
    })

    const userInfo = userSchema.parse(userResponse.data)

    // manages existing user in the database
    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id
      }
    })

    // if the users doesn't exist then create the user
    // based on the `userInfo` data
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url
        }
      })
    }

    const token = app.jwt.sign(
    {
      // payload
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    {
      // additional options
      sub: user.id,
      expiresIn: '30 days',
    })

    return {
      token
    }
  })
}
import makeServiceWorkerEnv from 'service-worker-mock'

declare let global: unknown

describe('handle', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })

  // test('handle GET', async () => {
  //   const result = await handleRequest(new Request('/', { method: 'GET' }))
  //   expect(result.status).toEqual(200)
  //   const text = await result.text()
  //   expect(text).toEqual('request method: GET')
  // })
})

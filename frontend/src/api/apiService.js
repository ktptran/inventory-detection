import { get, put } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

async function returnHeaders() {
  const authToken = (await fetchAuthSession()).tokens?.accessToken?.toString();
  return {
    Authorization: authToken,
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PUT, POST',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
}

async function putImage(image, uuid) {
  try {
    const restOperation = put({
      apiName: 'HttpApi',
      path: '/image',
      options: {
        headers: await returnHeaders(),
        body: {
          image,
          uuid,
        },
      },
    });
    const response = await restOperation.response;
    console.log('PUT call succeeded: ', response);
  } catch (err) {
    console.error('PUT call failed: ', err);
  }
}

async function getImage(key_name) {
  try {
    const restOperation = get({
      apiName: 'HttpApi',
      path: `/image/${key_name}`,
      options: {
        headers: await returnHeaders(),
      },
    });
    const response = await restOperation.response;
    console.log('GET call succeeded: ', response);
  } catch (err) {
    console.error('GET call failed: ', err);
  }
}

async function getInventory() {
  try {
    const restOperation = get({
      apiName: 'HttpApi',
      path: '/inventory',
      options: {
        headers: await returnHeaders(),
      },
    });
    const { body } = await restOperation.response;
    const json = await body.json();
    // console.log('GET call succeeded: ', json);
    return json;
  } catch (err) {
    console.error('GET call failed: ', err);
  }
}

export { getImage, getInventory, putImage };

import axios from "axios";

// const { nombreContratista, mailContrado } = req.body;
export function pagosMp() {
  return async function (dispatch) {
    try {
      return dispatch({
        type: "MP_PAYMENT",
        payload: (await axios.post(`/pago/payment`)).data,
      });
    } catch (e) {
      console.error(e, "error catch action payment MercadoPago");
    }
  };
}

export function subscriptionMp(status, subscription_id, user_id) {
  return async function (dispatch) {
    if (!status && !subscription_id) {
      try {
        return dispatch({
          type: "MP_SUBSCRIPTION",
          payload: (await axios.post(`/pago/subscription`, { user_id })).data,
        });
      } catch (e) {
        console.error(e, "error catch action subscription MercadoPago");
      }
    }
  };
}

export function consultSub(id) {
  console.log(`consulta por la suscripcion ${id}`);
  return async function (dispatch) {
    try {
      if (id !== undefined) {
        const idsub = await id;
        return dispatch({
          type: "MP_SUBSCRIPTION_CONSULT",
          payload: (await axios.get(`/pago/consultSub/${idsub}`)).data,
        });
      }
    } catch (e) {
      console.error(e, "error catch action subscription consult MercadoPago");
    }
  };
}

export function consultPay(id) {
  return async function (dispatch) {
    try {
      return dispatch({
        type: "MP_PAYMENT_CONSULT",
        payload: (await axios.get(`/pago/consultPay/${id}`)).data,
      });
    } catch (e) {
      console.error(e, "error catch action payment consult MercadoPago");
    }
  };
}

export function setSubscriptionId(payload) {
  const { user_id, subscription_id, status } = payload;

  return async function (dispatch) {
    try {
      return dispatch({
        type: "MP_SET_SUSCRIPTION_ID",
        payload: (
          await axios.put(`/usuarios/sub/${user_id}`, {
            subscription_id,
            status,
          })
        ).data,
      });
    } catch (e) {
      console.error(e, "error catch action SET ID MercadoPago");
    }
  };
}

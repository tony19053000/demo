export const blankAddress = {name:'', phone:'', street:'', city:'', pin:''};
export const paymentOptions = ['No preference', 'UPI', 'Card', 'Cash on delivery'];

export function readPreferences(id) {
  let data;
  try { data = id && JSON.parse(localStorage.getItem('sense-settings:' + id)); } catch {}
  return {
    addresses: Array.isArray(data?.addresses) ? data.addresses : [],
    payment: paymentOptions.includes(data?.payment) ? data.payment : paymentOptions[0]
  };
}

export function savePreferences(id, changes) {
  const next = {...readPreferences(id), ...changes};
  localStorage.setItem('sense-settings:' + id, JSON.stringify(next));
  return next;
}

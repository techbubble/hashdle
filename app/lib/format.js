const format = {
    trunc18(n) {
      return Math.trunc(Number(n) / 1e18);
    },
  
    currency(amount, digits) {
        if (digits == undefined) digits = 0;
        return Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: digits,
              maximumFractionDigits: digits,
            }).format(amount)
  
    },
  
    display(n, isCurrency, digits) {
        return isCurrency === true
            ? format.currency(Number(n), digits)
            : Number(n).toLocaleString("en-US",{
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
              });
    },

    display18C(n) {
        return format.currency(Number(n)/10**18, 0)
    },

    display18(n) {
        return format.display(Number(n)/10**18, false, 0)
    },

    bigNum(n) {
        const converted = Number(n) / Math.pow(10, 18); 
        return converted.toLocaleString(undefined, { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 0 
        });
    },

  };
  
  export default format;
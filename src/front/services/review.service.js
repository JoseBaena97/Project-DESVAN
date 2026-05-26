const url = import.meta.env.VITE_BACKEND_URL;

const createReview = async (reviewData) => {
  try {
    const resp = await fetch(url + "api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(reviewData),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.log("Error creating review", data);
      throw new Error(data?.msg || "Error creating review");
    }

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default {
  createReview,
};

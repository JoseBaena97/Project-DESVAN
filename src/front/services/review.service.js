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

const getWrittenReviewsByUser = async (userId) => {
  try {
    const resp = await fetch(url + `api/user/${userId}/written_reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.msg || "Error fetching written reviews");
    }
    return data?.data ?? data?.msg ?? [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const updateReview = async (reviewId, reviewData) => {
  try {
    const resp = await fetch(url + `api/review/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(reviewData),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.log("Error updating review", data);
      throw new Error(data?.msg || "Error updating review");
    }

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const deleteReview = async (reviewId) => {
  try {
    const resp = await fetch(url + `api/review/${reviewId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.log("Error deleting review", data);
      throw new Error(data?.msg || "Error deleting review");
    }

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getReceivedReviewsByUser = async (userId) => {
  try {
    const resp = await fetch(url + `api/user/${userId}/recieved_reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.msg || "Error fetching received reviews");
    }
    return data?.data ?? data?.msg ?? [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default {
  createReview,
  getWrittenReviewsByUser,
  getReceivedReviewsByUser,
  updateReview,
  deleteReview,
};

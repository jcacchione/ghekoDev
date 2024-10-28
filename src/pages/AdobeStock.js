import React, { useEffect, useState } from "react";
import {
  Table,
  Container,
  Image,
  Alert,
  Spinner,
  Pagination,
  Form,
  Row,
  Col,
  ButtonGroup,
  ToggleButton,
  Modal,
  Card,
  ListGroup,
  Button,
} from "react-bootstrap";

const AdobeStock = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentFilter, setContentFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const imagesPerPage = 10;

  const contentTypes = [
    { name: "All Images", value: "all" },
    { name: "AI Generated", value: "ai" },
    { name: "Non-AI", value: "photo" },
  ];

  const calculateTrendScore = (views, downloads) => {
    const numViews = Number(views) || 0;
    const numDownloads = Number(downloads) || 0;

    // Adjust the scaling factors for more meaningful percentages
    const normalizedDownloads = (numDownloads / 1000) * 100; // Scale per 1000 downloads
    const normalizedViews = (numViews / 5000) * 100; // Scale per 5000 views

    // Calculate weighted score
    const score = (normalizedDownloads * 2 + normalizedViews) / 3;

    // Cap at 100% and ensure minimum of 0%
    return Math.min(100, Math.max(0, score));
  };

  const getKeywordText = (keyword) => {
    if (!keyword) return "";
    if (typeof keyword === "string") return keyword;
    if (typeof keyword === "object" && keyword.name) return keyword.name;
    if (typeof keyword === "object" && keyword.text) return keyword.text;
    return "";
  };

  const getCategoryName = (category) => {
    if (!category) return "Uncategorized";
    return typeof category === "object" && category.name
      ? category.name
      : String(category);
  };

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        // Construct search parameters to match website behavior
        const params = new URLSearchParams({
          locale: "en_US",
          "search_parameters[limit]": "100",
          "search_parameters[offset]": "0",
          "search_parameters[order]": "relevance",
          "search_parameters[filters][content_type:photo]": "1",
          "search_parameters[filters][editorial]": "0",
          "search_parameters[filters][isolated]": "0",
          "search_parameters[filters][panoramic]": "0",
          "search_parameters[filters][premium]": "false",
          "search_parameters[words]": searchTerm,
          "search_parameters[thumbnail_size]": "240",
          "search_parameters[filters][orientation]": "all",
          "search_parameters[filters][has_releases]": "",
          "search_parameters[filters][colors]": "",
          "search_parameters[filters][undiscovered]": "0",
          "search_parameters[filters][video_duration_min]": "",
          "search_parameters[filters][video_duration_max]": "",
          "search_parameters[filters][template_category_id]": "",
          "search_parameters[filters][template_type_id]": "",
          "search_parameters[similar_image]": "",
        });

        // Add result columns
        const resultColumns = [
          "id",
          "title",
          "creator_name",
          "creator_id",
          "category",
          "thumbnail_url",
          "thumbnail_width",
          "thumbnail_height",
          "width",
          "height",
          "creation_date",
          "keywords",
          "nb_downloads",
          "nb_views",
          "description",
          "details_url",
          "vector_type",
          "content_type",
          "media_type_id",
          "category_hierarchy",
        ];

        resultColumns.forEach((column) => {
          params.append("result_columns[]", column);
        });

        // Handle content type filter
        if (contentFilter !== "all") {
          if (contentFilter === "photo") {
            params.set("search_parameters[filters][content_type:photo]", "1");
            params.delete("search_parameters[filters][content_type:ai]");
          } else if (contentFilter === "ai") {
            params.set("search_parameters[filters][content_type:ai]", "1");
            params.delete("search_parameters[filters][content_type:photo]");
          }
        }

        const response = await fetch(
          `https://stock.adobe.io/Rest/Media/1/Search/Files?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "x-api-key": process.env.REACT_APP_ADOBE_STOCK_API_KEY,
              "X-Product": "GhekoDev/1.0",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const processedImages = (data.files || []).map((item, index) => {
          const views = parseInt(item.nb_views, 10) || 0;
          const downloads = parseInt(item.nb_downloads, 10) || 0;
          const trendScore = calculateTrendScore(views, downloads);

          return {
            ...item,
            rank: index + 1,
            views,
            downloads,
            trendScore,
            stockUrl:
              item.details_url ||
              `https://stock.adobe.com/images/${encodeURIComponent(
                item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
              )}/${item.id}`,
          };
        });

        setImages(processedImages);
      } catch (error) {
        console.error("Error fetching stock images:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [contentFilter, searchTerm]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleContentFilterChange = (value) => {
    setContentFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredImages = images.filter(
    (image) =>
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.category?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const sortedImages = [...filteredImages].sort((a, b) => {
    if (!sortField) return 0;

    const fieldA = a[sortField] ?? "";
    const fieldB = b[sortField] ?? "";

    const comparison =
      typeof fieldA === "string"
        ? fieldA.localeCompare(fieldB)
        : fieldA - fieldB;

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = sortedImages.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(sortedImages.length / imagesPerPage);

  const renderImageDetails = () => {
    if (!selectedImage) return null;

    return (
      <Card>
        <Card.Img
          variant="top"
          src={selectedImage.thumbnail_url}
          style={{
            objectFit: "contain",
            width: "100%",
            height: "400px",
          }}
        />
        <Card.Body>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <strong>Category:</strong>{" "}
              {getCategoryName(selectedImage.category)}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Creator:</strong>{" "}
              {selectedImage.creator_name || "Unknown"}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Downloads:</strong>{" "}
              {selectedImage.nb_downloads
                ? parseInt(selectedImage.nb_downloads, 10).toLocaleString()
                : "0"}
            </ListGroup.Item>
            {/* <ListGroup.Item>
              <strong>Views:</strong>{" "}
              {selectedImage.nb_views
                ? parseInt(selectedImage.nb_views, 10).toLocaleString()
                : "0"}
            </ListGroup.Item> */}
            <ListGroup.Item>
              <strong>Trend Score:</strong>{" "}
              {typeof selectedImage.trendScore === "number" &&
              selectedImage.trendScore > 0
                ? `${selectedImage.trendScore.toFixed(1)}%`
                : "0.0%"}
            </ListGroup.Item>
            {Array.isArray(selectedImage.keywords) &&
              selectedImage.keywords.length > 0 && (
                <ListGroup.Item>
                  <strong>Keywords:</strong>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {selectedImage.keywords.map((keyword, index) => (
                      <span key={index} className="bg-light p-1 rounded small">
                        {getKeywordText(keyword)}
                      </span>
                    ))}
                  </div>
                </ListGroup.Item>
              )}
            {selectedImage.description && (
              <ListGroup.Item>
                <strong>Description:</strong>
                <br />
                {String(selectedImage.description)}
              </ListGroup.Item>
            )}
            <ListGroup.Item className="text-center">
              <Button
                variant="primary"
                href={selectedImage.stockUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2"
              >
                View on Adobe Stock
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Failed to load stock images: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col md={6}>
          <h1>Featured Trending Images</h1>
        </Col>
        <Col md={3}></Col>
        <Col md={3}>
          <Form.Control
            id="searchImages"
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </Col>
        <Col md={4}></Col>
      </Row>

      <Row>
        <Col>
          <ButtonGroup>
            {contentTypes.map((type) => (
              <ToggleButton
                key={type.value}
                id={`radio-${type.value}`}
                type="radio"
                variant="outline-primary"
                name="content-type"
                value={type.value}
                checked={contentFilter === type.value}
                onChange={(e) =>
                  handleContentFilterChange(e.currentTarget.value)
                }
              >
                {type.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </Col>
        <Col>
          <div className="d-flex justify-content-end">
            <Pagination>
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 2 &&
                    pageNumber <= currentPage + 2)
                ) {
                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                }
                if (
                  pageNumber === currentPage - 3 ||
                  pageNumber === currentPage + 3
                ) {
                  return <Pagination.Ellipsis key={pageNumber} />;
                }
                return null;
              })}

              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </Col>
      </Row>

      {/* <div className="text-center mt-2">
        <small className="text-muted">
          Showing {indexOfFirstImage + 1} to{" "}
          {Math.min(indexOfLastImage, sortedImages.length)} of{" "}
          {sortedImages.length} images
        </small>
      </div> */}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("rank")}
              style={{ cursor: "pointer" }}
            >
              Rank {sortField === "rank" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th>Preview</th>
            <th
              onClick={() => handleSort("title")}
              style={{ cursor: "pointer", width: "45%" }}
            >
              Title {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => handleSort("category")}
              style={{ cursor: "pointer" }}
            >
              Category{" "}
              {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              className="text-end"
              onClick={() => handleSort("downloads")}
              style={{ cursor: "pointer" }}
            >
              Downloads{" "}
              {sortField === "downloads" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              className="text-end"
              onClick={() => handleSort("trendScore")}
              style={{ cursor: "pointer" }}
            >
              Trend Score{" "}
              {sortField === "trendScore" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentImages.map((image) => (
            <tr key={image.id}>
              <td>{image.rank}</td>
              <td>
                <Image
                  src={image.thumbnail_url}
                  alt={image.title}
                  thumbnail
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => handleImageClick(image)}
                />
              </td>
              <td>{image.title}</td>
              <td>{getCategoryName(image.category)}</td>
              <td className="text-end">
                {image.downloads > 0 ? image.downloads.toLocaleString() : "0"}
              </td>
              <td className="text-end">
                {image.trendScore > 0
                  ? `${image.trendScore.toFixed(1)}%`
                  : "0.0%"}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedImage?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderImageDetails()}</Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdobeStock;

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Input,
//   Button,
//   Space,
//   Row,
//   Col,
//   Tabs,
//   message,
//   Modal,
// } from "antd";
// import {
//   DeleteOutlined,
//   EditOutlined,
//   EyeOutlined,
//   ReloadOutlined,
// } from "@ant-design/icons";
// import { DiseaseResponseDTO } from "../../models/Disease";
// import diseaseService from "../../service/diseaseService";
// import moment from "moment";
// import AddDiseaseModal from "./AddDiseaseButton";
// import EditDiseaseModal from "./EditDiseaseModal";
// import { ColumnType } from "antd/es/table";
// import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";

// const { Search } = Input;
// const { TabPane } = Tabs;

// // Interface Disease khớp với DiseaseResponseDTO từ backend
// interface Disease extends DiseaseResponseDTO {
//   diseaseId: number; // Alias cho DiseaseId từ DiseaseResponseDTO
// }

// const DiseaseManagePage: React.FC = () => {
//   const [diseases, setDiseases] = useState<Disease[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 5,
//     total: 0,
//   });
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [activeTab, setActiveTab] = useState("activeDiseases");
//   const [isAddDiseaseModalVisible, setIsAddDiseaseModalVisible] =
//     useState(false);
//   const [isEditDiseaseModalVisible, setIsEditDiseaseModalVisible] =
//     useState(false);
//   const [editedDisease, setEditedDisease] = useState<Disease | null>(null);
//   const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); // State cho modal chi tiết
//   const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null); // Disease được chọn để xem chi tiết

//   const fetchDiseases = async () => {
//     setLoading(true);
//     try {
//       const response = await diseaseService.getAllDiseases();
//       console.log("Phản hồi API:", response);
//       const filteredDiseases = response
//         .filter((disease) =>
//           activeTab === "inactiveDiseases"
//             ? disease.isActive === "Inactive"
//             : disease.isActive === "Active"
//         )
//         .map((disease) => ({ ...disease, diseaseId: disease.diseaseId }));
//       console.log("Bệnh đã lọc:", filteredDiseases);
//       setDiseases(filteredDiseases);
//       setPagination({
//         current: 1,
//         pageSize: pagination.pageSize,
//         total: filteredDiseases.length,
//       });
//     } catch (error) {
//       console.error("Lỗi khi lấy bệnh:", error);
//       message.error(
//         "Không thể lấy danh sách bệnh: " + (error as Error).message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDiseases();
//   }, [activeTab]);

//   const handleTableChange = (pagination: any) => {
//     const { current, pageSize } = pagination;
//     setPagination((prev) => ({ ...prev, current, pageSize }));
//     fetchDiseases();
//   };

//   const onSearch = (value: string) => {
//     setSearchKeyword(value);
//     setDiseases((prevDiseases) =>
//       prevDiseases.filter((disease) =>
//         disease.name.toLowerCase().includes(value.toLowerCase())
//       )
//     );
//   };

//   const handleReset = () => {
//     setSearchKeyword("");
//     fetchDiseases();
//   };

//   const handleAddDisease = () => {
//     setIsAddDiseaseModalVisible(true);
//   };

//   const handleCloseModal = () => {
//     setIsAddDiseaseModalVisible(false);
//     setIsEditDiseaseModalVisible(false);
//     setEditedDisease(null);
//     setIsDetailModalVisible(false);
//   };

//   const handleUpdate = (disease: Disease) => {
//     if (!disease.diseaseId || typeof disease.diseaseId !== "number") {
//       console.error("Dữ liệu bệnh không hợp lệ trong handleUpdate:", disease);
//       message.error("Dữ liệu bệnh không hợp lệ để chỉnh sửa");
//       return;
//     }
//     console.log("Chỉnh sửa Bệnh với ID:", disease.diseaseId);
//     setEditedDisease(disease);
//     setIsEditDiseaseModalVisible(true);
//   };

//   const handleDelete = async (diseaseId: number) => {
//     Modal.confirm({
//       title: "Bạn có chắc chắn muốn xóa bệnh này không?",
//       content: "Hành động này không thể hoàn tác.",
//       okText: "Có",
//       okType: "danger",
//       cancelText: "Không",
//       onOk: async () => {
//         try {
//           await diseaseService.deleteDisease(diseaseId);
//           message.success("Bệnh đã được xóa thành công");
//           fetchDiseases(); // Refresh danh sách bệnh sau khi xóa
//         } catch (error) {
//           console.error("Lỗi khi xóa bệnh:", error);
//           message.error("Không thể xóa bệnh: " + (error as Error).message);
//         }
//       },
//       onCancel() {
//         console.log("Hủy xóa");
//       },
//     });
//   };

//   const handleViewDetail = (disease: Disease) => {
//     if (!disease.diseaseId || typeof disease.diseaseId !== "number") {
//       console.error("Dữ liệu bệnh không hợp lệ để xem chi tiết:", disease);
//       message.error("Dữ liệu bệnh không hợp lệ để xem");
//       return;
//     }
//     console.log("Xem chi tiết Bệnh với ID:", disease.diseaseId);
//     setSelectedDisease(disease);
//     setIsDetailModalVisible(true);
//   };

//   const handleTabChange = (key: string) => {
//     setActiveTab(key);
//   };

//   const columns: ColumnType<VaccinePackageResponseDTO>[] = [
//     {
//       title: "STT",
//       key: "index",
//       width: 50,
//       align: "center",
//       render: (_: any, __: VaccinePackageResponseDTO, index: number) => {
//         const currentIndex =
//           (pagination.current - 1) * pagination.pageSize + index + 1;
//         return currentIndex;
//       },
//     },
//     {
//       title: "Tên",
//       dataIndex: "name",
//       key: "name",
//     },
//     {
//       title: "Mô tả",
//       dataIndex: "description",
//       width: 500,
//       key: "Description",
//     },
//     {
//       title: "Trạng thái",
//       dataIndex: "isActive",
//       key: "isActive",
//       render: (isActive: string) =>
//         isActive === "Active" ? "Hoạt động" : "Không hoạt động",
//     },
//     {
//       title: "Ngày tạo",
//       dataIndex: "createdDate",
//       key: "CreatedDate",
//       render: (date: Date | string) => moment(date).format("DD-MM-YYYY"),
//     },
//     {
//       title: "Ngày sửa đổi",
//       dataIndex: "modifiedDate",
//       key: "ModifiedDate",
//       render: (date: Date | string) => moment(date).format("DD-MM-YYYY"),
//     },
//     {
//       title: "Hành động",
//       key: "action",
//       render: (_: any, record: Disease) => {
//         console.log("Bản ghi trong Cột Hành động:", record);
//         if (!record.diseaseId || typeof record.diseaseId !== "number") {
//           console.error("ID bệnh không hợp lệ trong bản ghi:", record);
//           return null;
//         }
//         return (
//           <span>
//             <EditOutlined
//               onClick={() => handleUpdate(record)}
//               style={{ color: "black", cursor: "pointer", marginRight: 8 }}
//             />
//             <EyeOutlined
//               onClick={() => handleViewDetail(record)}
//               style={{ color: "blue", cursor: "pointer", marginRight: 8 }}
//             />
//             <DeleteOutlined
//               onClick={() => handleDelete(record.diseaseId)}
//               style={{ color: "red", cursor: "pointer" }}
//             />
//           </span>
//         );
//       },
//     },
//   ];

//   return (
//     <div>
//       <Tabs
//         className="custom-tabs mt-20 ml-10 mr-10"
//         defaultActiveKey="activeDiseases"
//         onChange={handleTabChange}
//       >
//         <TabPane tab="Bệnh Đang Có" key="activeDiseases">
//           <Row justify="space-between" style={{ marginBottom: 16 }}>
//             <Col>
//               <Space className="custom-search">
//                 <Search
//                   placeholder="Tìm kiếm theo tên bệnh"
//                   onSearch={onSearch}
//                   enterButton
//                   allowClear
//                   value={searchKeyword}
//                   onChange={(e) => setSearchKeyword(e.target.value)}
//                 />
//                 <ReloadOutlined
//                   onClick={handleReset}
//                   style={{ fontSize: "24px", cursor: "pointer" }}
//                 />
//               </Space>
//             </Col>
//             <Col>
//               <Button
//                 type="primary"
//                 className="custom-button"
//                 onClick={handleAddDisease}
//               >
//                 Thêm Bệnh
//               </Button>
//             </Col>
//           </Row>
//           <Table
//             columns={columns}
//             dataSource={diseases}
//             rowKey="diseaseId"
//             pagination={{
//               current: pagination.current,
//               pageSize: pagination.pageSize,
//               total: pagination.total,
//               showSizeChanger: true,
//               showQuickJumper: true,
//             }}
//             loading={loading}
//             onChange={handleTableChange}
//           />
//         </TabPane>
//         <TabPane tab="Bệnh Không Có" key="inactiveDiseases">
//           <Row justify="space-between" style={{ marginBottom: 16 }}>
//             <Col>
//               <Space>
//                 <Search
//                   placeholder="Tìm kiếm theo tên bệnh"
//                   onSearch={onSearch}
//                   enterButton
//                   allowClear
//                   value={searchKeyword}
//                   onChange={(e) => setSearchKeyword(e.target.value)}
//                 />
//                 <ReloadOutlined
//                   onClick={handleReset}
//                   style={{ fontSize: "24px", cursor: "pointer" }}
//                 />{" "}
//               </Space>
//             </Col>
//             <Col>
//               <Button type="primary" onClick={handleAddDisease}>
//                 Thêm Bệnh
//               </Button>
//             </Col>
//           </Row>
//           <Table
//             columns={columns}
//             dataSource={diseases}
//             rowKey="diseaseId"
//             pagination={{
//               current: pagination.current,
//               pageSize: pagination.pageSize,
//               total: pagination.total,
//               showSizeChanger: true,
//               showQuickJumper: true,
//             }}
//             loading={loading}
//             onChange={handleTableChange}
//           />
//         </TabPane>
//       </Tabs>

//       <AddDiseaseModal
//         visible={isAddDiseaseModalVisible}
//         onClose={handleCloseModal}
//         refreshDiseases={fetchDiseases}
//       />

//       {editedDisease && (
//         <EditDiseaseModal
//           disease={editedDisease}
//           visible={isEditDiseaseModalVisible}
//           onClose={handleCloseModal}
//           refreshDiseases={fetchDiseases}
//         />
//       )}
//       {/* Modal để xem chi tiết thông tin disease */}
//       <Modal
//         title="Chi tiết Bệnh"
//         visible={isDetailModalVisible}
//         onCancel={handleCloseModal}
//         footer={null}
//       >
//         {selectedDisease && (
//           <div style={{ padding: 16 }}>
//             <p>
//               <strong>Tên:</strong> {selectedDisease.name || "N/A"}
//             </p>
//             <p>
//               <strong>Mô tả:</strong> {selectedDisease.description || "N/A"}
//             </p>
//             <p>
//               <strong>Trạng thái:</strong>{" "}
//               {selectedDisease.isActive === "Active"
//                 ? "Hoạt động"
//                 : "Không hoạt động"}
//             </p>
//             <p>
//               <strong>Ngày tạo:</strong>{" "}
//               {moment(selectedDisease.createdDate).format(
//                 "HH:mm - DD/MM/YYYY"
//               ) || "N/A"}
//             </p>
//             <p>
//               <strong>Ngày sửa đổi:</strong>{" "}
//               {moment(selectedDisease.modifiedDate).format(
//                 "HH:mm - DD/MM/YYYY"
//               ) || "N/A"}
//             </p>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default DiseaseManagePage;

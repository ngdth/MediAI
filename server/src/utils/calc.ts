export const calculateTotalAmount = (
    testFees: any[] = [],
    medicineFees: any[] = [],
    additionalFees?: number
) => {
    // Kiểm tra các giá trị undefined và gán giá trị mặc định
    const safeAdditionalFees = typeof additionalFees === 'number' ? additionalFees : 0;

    const totalTestFees = Array.isArray(testFees) ? testFees.reduce((sum, test) => sum + (test.price || 0), 0) : 0;
    const totalMedicineFees = Array.isArray(medicineFees) ? medicineFees.reduce((sum, med) => sum + (med.totalPrice || 0), 0) : 0;

    return totalTestFees + totalMedicineFees + safeAdditionalFees;
};

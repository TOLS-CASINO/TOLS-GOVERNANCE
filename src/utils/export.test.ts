import { expect, test, describe, mock, beforeEach, afterEach } from "bun:test";
import { exportToCSV, formatCurrency } from "./export";

describe("exportToCSV", () => {
    let mockCreateObjectURL: any;
    let mockRevokeObjectURL: any;
    let mockAppendChild: any;
    let mockRemoveChild: any;
    let mockClick: any;

    let originalCreateObjectURL: any;
    let originalRevokeObjectURL: any;
    let originalDocument: any;

    beforeEach(() => {
        mockCreateObjectURL = mock(() => 'blob:test-url');
        mockRevokeObjectURL = mock(() => {});
        mockAppendChild = mock(() => {});
        mockRemoveChild = mock(() => {});
        mockClick = mock(() => {});

        originalCreateObjectURL = global.URL.createObjectURL;
        originalRevokeObjectURL = global.URL.revokeObjectURL;

        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;

        originalDocument = global.document;
        global.document = {
            createElement: mock((tag: string) => {
                if (tag === 'a') {
                    return {
                        href: '',
                        download: '',
                        click: mockClick,
                        setAttribute: mock(() => {})
                    };
                }
                return {};
            }),
            body: {
                appendChild: mockAppendChild,
                removeChild: mockRemoveChild
            }
        } as any;
    });

    afterEach(() => {
        global.URL.createObjectURL = originalCreateObjectURL;
        global.URL.revokeObjectURL = originalRevokeObjectURL;
        global.document = originalDocument;
    });

    test("should return early if data is empty", () => {
        exportToCSV([], "test");
        expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });

    test("should export simple data to CSV", async () => {
        const data = [{ name: "John", age: 30 }];
        exportToCSV(data, "users");

        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockAppendChild).toHaveBeenCalled();
        expect(mockClick).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalled();

        const blobArg = mockCreateObjectURL.mock.calls[0][0] as Blob;
        expect(blobArg.type).toBe('text/csv;charset=utf-8;');
        const text = await blobArg.text();
        expect(text).toBe("name,age\nJohn,30");
    });

    test("should handle strings with commas and quotes", async () => {
        const data = [{ name: "John, Jr.", desc: 'He said "Hello"' }];
        exportToCSV(data, "users");

        const blobArg = mockCreateObjectURL.mock.calls[0][0] as Blob;
        const text = await blobArg.text();
        expect(text).toBe('name,desc\n"John, Jr.","He said ""Hello"""');
    });
});

describe("formatCurrency", () => {
    test("should format numbers to currency string", () => {
        expect(formatCurrency(1000)).toBe("$1,000.00");
        expect(formatCurrency(10.5)).toBe("$10.50");
        expect(formatCurrency(0)).toBe("$0.00");
    });
});

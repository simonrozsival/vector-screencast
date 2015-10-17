import Metadata from '../../VideoData/Metadata';
export default class MetadataFactory {
    FromSVG(rootNode: Element): Metadata;
    ToSVG(data: Metadata): Node;
}
